"""
Rome AI Agent — Health Check Lambda
"""
import json
import os
from datetime import datetime, timezone


def handler(event, context):
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({
            'status': 'healthy',
            'version': os.environ.get('VERSION', '1.0.0'),
            'environment': os.environ.get('ENVIRONMENT', 'dev'),
            'timestamp': datetime.now(timezone.utc).isoformat(),
        }),
    }
