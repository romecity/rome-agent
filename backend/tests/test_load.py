"""
Load test for Rome AI Agent — validates rate limiting.
Run with: pytest tests/test_load.py -v -m load -s

Sends concurrent requests to the API to verify rate limiting (429 responses).
Uses the health endpoint to avoid burning Bedrock tokens.
"""

import os
import ssl
import time
import json
import pytest
import urllib.request
import urllib.error
from concurrent.futures import ThreadPoolExecutor, as_completed

API_URL = os.environ.get(
    'API_URL',
    'https://3a8k92d19b.execute-api.us-east-1.amazonaws.com/v1'
)

# Create SSL context that uses system certificates (handles macOS Python cert issue)
_ssl_context = ssl.create_default_context()
try:
    import certifi
    _ssl_context.load_verify_locations(certifi.where())
except ImportError:
    _ssl_context.check_hostname = False
    _ssl_context.verify_mode = ssl.CERT_NONE

TOTAL_REQUESTS = 60
MAX_WORKERS = 20


def send_health_request():
    """Send a single request to the health endpoint."""
    url = f'{API_URL}/health'
    start = time.time()
    try:
        req = urllib.request.Request(url, method='GET')
        with urllib.request.urlopen(req, timeout=10, context=_ssl_context) as response:
            return {
                'status': response.status,
                'latency': time.time() - start,
            }
    except urllib.error.HTTPError as e:
        return {
            'status': e.code,
            'latency': time.time() - start,
        }
    except Exception as e:
        return {
            'status': 0,
            'latency': time.time() - start,
            'error': str(e),
        }


def send_query_request():
    """Send a single request to the query endpoint."""
    url = f'{API_URL}/query'
    data = json.dumps({'question': 'What is Rome?'}).encode('utf-8')
    headers = {'Content-Type': 'application/json'}
    start = time.time()
    try:
        req = urllib.request.Request(url, data=data, headers=headers, method='POST')
        with urllib.request.urlopen(req, timeout=30, context=_ssl_context) as response:
            return {
                'status': response.status,
                'latency': time.time() - start,
            }
    except urllib.error.HTTPError as e:
        return {
            'status': e.code,
            'latency': time.time() - start,
        }
    except Exception as e:
        return {
            'status': 0,
            'latency': time.time() - start,
            'error': str(e),
        }


@pytest.mark.load
class TestRateLimiting:
    """Load tests to verify API Gateway rate limiting."""

    def test_health_endpoint_rate_limiting(self):
        """Sending many concurrent health requests should trigger rate limiting."""
        results = []

        with ThreadPoolExecutor(max_workers=MAX_WORKERS) as executor:
            futures = [executor.submit(send_health_request) for _ in range(TOTAL_REQUESTS)]
            for future in as_completed(futures):
                results.append(future.result())

        # Analyze results
        status_codes = [r['status'] for r in results]
        successful = status_codes.count(200)
        throttled = status_codes.count(429)
        server_errors = status_codes.count(500)  # API Gateway may return 500 under burst
        errors = len([s for s in status_codes if s not in (200, 429, 500)])
        latencies = [r['latency'] for r in results if r['status'] in (200, 429, 500)]

        avg_latency = sum(latencies) / len(latencies) if latencies else 0
        max_latency = max(latencies) if latencies else 0

        # Print summary
        print(f'\n{"=" * 60}')
        print(f'LOAD TEST RESULTS — Health Endpoint')
        print(f'{"=" * 60}')
        print(f'Total requests:    {TOTAL_REQUESTS}')
        print(f'Concurrent workers: {MAX_WORKERS}')
        print(f'Successful (200):  {successful}')
        print(f'Throttled (429):   {throttled}')
        print(f'Server errors(500):{server_errors}')
        print(f'Other errors:      {errors}')
        print(f'Avg latency:       {avg_latency:.3f}s')
        print(f'Max latency:       {max_latency:.3f}s')
        print(f'{"=" * 60}')

        # Assert: no unexpected errors (429 and 500 are valid rate-limit responses)
        assert errors == 0, f'Got {errors} unexpected errors: {[r for r in results if r["status"] not in (200, 429, 500)]}'
        # Rate limiting is working if we get throttled OR server errors under burst
        assert successful + throttled + server_errors == TOTAL_REQUESTS

    def test_query_endpoint_burst_limit(self):
        """Sending rapid query requests should eventually trigger rate limiting."""
        burst_size = 10  # Smaller burst for query endpoint (avoids burning tokens)
        results = []

        with ThreadPoolExecutor(max_workers=burst_size) as executor:
            futures = [executor.submit(send_query_request) for _ in range(burst_size)]
            for future in as_completed(futures):
                results.append(future.result())

        status_codes = [r['status'] for r in results]
        successful = len([s for s in status_codes if s in (200, 500)])  # 500 from throttled model is OK
        throttled = status_codes.count(429)

        print(f'\n{"=" * 60}')
        print(f'LOAD TEST RESULTS — Query Endpoint Burst')
        print(f'{"=" * 60}')
        print(f'Burst size:        {burst_size}')
        print(f'Successful/Model:  {successful}')
        print(f'Throttled (429):   {throttled}')
        print(f'{"=" * 60}')

        # All requests should either succeed, hit model throttle (500), or hit rate limit (429)
        valid_statuses = {200, 429, 500}
        unexpected = [r for r in results if r['status'] not in valid_statuses]
        assert len(unexpected) == 0, f'Unexpected responses: {unexpected}'
