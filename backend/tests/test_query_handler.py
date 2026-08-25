"""
Unit tests for Rome AI Agent query handler Lambda.
Tests handler logic with mocked AWS services.
"""

import json
import pytest
from unittest.mock import patch, MagicMock
from botocore.exceptions import ClientError


class TestInputValidation:
    """Test input validation in the query handler."""

    @patch('query_handler.index.bedrock_agent')
    @patch('query_handler.index.bedrock_runtime')
    @patch('query_handler.index.table')
    def test_missing_question_returns_400(self, mock_table, mock_runtime, mock_agent,
                                          api_gateway_event, lambda_context):
        """Missing question field should return 400."""
        from query_handler.index import handler

        event = api_gateway_event({'not_question': 'test'})
        response = handler(event, lambda_context)

        assert response['statusCode'] == 400
        body = json.loads(response['body'])
        assert 'error' in body
        assert '3 characters' in body['error']

    @patch('query_handler.index.bedrock_agent')
    @patch('query_handler.index.bedrock_runtime')
    @patch('query_handler.index.table')
    def test_empty_question_returns_400(self, mock_table, mock_runtime, mock_agent,
                                        api_gateway_event, lambda_context):
        """Empty string question should return 400."""
        from query_handler.index import handler

        event = api_gateway_event({'question': ''})
        response = handler(event, lambda_context)

        assert response['statusCode'] == 400
        body = json.loads(response['body'])
        assert 'error' in body

    @patch('query_handler.index.bedrock_agent')
    @patch('query_handler.index.bedrock_runtime')
    @patch('query_handler.index.table')
    def test_short_question_returns_400(self, mock_table, mock_runtime, mock_agent,
                                        api_gateway_event, lambda_context):
        """Question shorter than 3 characters should return 400."""
        from query_handler.index import handler

        event = api_gateway_event({'question': 'ab'})
        response = handler(event, lambda_context)

        assert response['statusCode'] == 400
        body = json.loads(response['body'])
        assert '3 characters' in body['error']

    @patch('query_handler.index.bedrock_agent')
    @patch('query_handler.index.bedrock_runtime')
    @patch('query_handler.index.table')
    def test_long_question_returns_400(self, mock_table, mock_runtime, mock_agent,
                                       api_gateway_event, lambda_context):
        """Question longer than 500 characters should return 400."""
        from query_handler.index import handler

        long_question = 'x' * 501
        event = api_gateway_event({'question': long_question})
        response = handler(event, lambda_context)

        assert response['statusCode'] == 400
        body = json.loads(response['body'])
        assert '500 characters' in body['error']

    @patch('query_handler.index.bedrock_agent')
    @patch('query_handler.index.bedrock_runtime')
    @patch('query_handler.index.table')
    def test_null_body_returns_400(self, mock_table, mock_runtime, mock_agent,
                                   lambda_context):
        """Null/missing body should return 400."""
        from query_handler.index import handler

        event = {
            'body': None,
            'requestContext': {'identity': {'sourceIp': '127.0.0.1'}},
        }
        response = handler(event, lambda_context)

        assert response['statusCode'] == 400


class TestSuccessfulQuery:
    """Test successful RAG query flow."""

    @patch('query_handler.index.bedrock_agent')
    @patch('query_handler.index.bedrock_runtime')
    @patch('query_handler.index.table')
    def test_valid_query_returns_200(self, mock_table, mock_runtime, mock_agent,
                                     api_gateway_event, lambda_context,
                                     mock_bedrock_retrieval_response,
                                     mock_bedrock_model_response):
        """Valid question should return 200 with answer and sources."""
        from query_handler.index import handler

        mock_agent.retrieve.return_value = mock_bedrock_retrieval_response
        mock_runtime.invoke_model.return_value = mock_bedrock_model_response

        event = api_gateway_event({'question': 'What services does Rome offer?'})
        response = handler(event, lambda_context)

        assert response['statusCode'] == 200
        body = json.loads(response['body'])
        assert 'answer' in body
        assert 'sources' in body
        assert 'latency_ms' in body
        assert len(body['sources']) == 3
        assert isinstance(body['latency_ms'], int)

    @patch('query_handler.index.bedrock_agent')
    @patch('query_handler.index.bedrock_runtime')
    @patch('query_handler.index.table')
    def test_response_contains_source_documents(self, mock_table, mock_runtime, mock_agent,
                                                 api_gateway_event, lambda_context,
                                                 mock_bedrock_retrieval_response,
                                                 mock_bedrock_model_response):
        """Sources should include document name and excerpt."""
        from query_handler.index import handler

        mock_agent.retrieve.return_value = mock_bedrock_retrieval_response
        mock_runtime.invoke_model.return_value = mock_bedrock_model_response

        event = api_gateway_event({'question': 'What services does Rome offer?'})
        response = handler(event, lambda_context)

        body = json.loads(response['body'])
        source = body['sources'][0]
        assert 'document' in source
        assert 'excerpt' in source
        assert '02-rome-services.md' in source['document']

    @patch('query_handler.index.bedrock_agent')
    @patch('query_handler.index.bedrock_runtime')
    @patch('query_handler.index.table')
    def test_analytics_logged_to_dynamodb(self, mock_table, mock_runtime, mock_agent,
                                          api_gateway_event, lambda_context,
                                          mock_bedrock_retrieval_response,
                                          mock_bedrock_model_response):
        """Successful query should log analytics to DynamoDB."""
        from query_handler.index import handler

        mock_agent.retrieve.return_value = mock_bedrock_retrieval_response
        mock_runtime.invoke_model.return_value = mock_bedrock_model_response

        event = api_gateway_event({'question': 'What services does Rome offer?'})
        handler(event, lambda_context)

        # Verify DynamoDB put_item was called
        mock_table.put_item.assert_called_once()
        item = mock_table.put_item.call_args[1]['Item']
        assert 'queryId' in item
        assert 'timestamp' in item
        assert 'question' in item
        assert 'latency_ms' in item
        assert 'sourceCount' in item
        assert item['sourceCount'] == 3
        assert item['modelId'] == 'us.anthropic.claude-sonnet-4-6'
        assert item['environment'] == 'test'

    @patch('query_handler.index.bedrock_agent')
    @patch('query_handler.index.bedrock_runtime')
    @patch('query_handler.index.table')
    def test_cors_headers_present(self, mock_table, mock_runtime, mock_agent,
                                   api_gateway_event, lambda_context,
                                   mock_bedrock_retrieval_response,
                                   mock_bedrock_model_response):
        """Response should include CORS headers."""
        from query_handler.index import handler

        mock_agent.retrieve.return_value = mock_bedrock_retrieval_response
        mock_runtime.invoke_model.return_value = mock_bedrock_model_response

        event = api_gateway_event({'question': 'What services does Rome offer?'})
        response = handler(event, lambda_context)

        assert 'Access-Control-Allow-Origin' in response['headers']
        assert response['headers']['Access-Control-Allow-Origin'] == '*'


class TestErrorHandling:
    """Test error handling and resilience."""

    @patch('query_handler.index.bedrock_agent')
    @patch('query_handler.index.bedrock_runtime')
    @patch('query_handler.index.table')
    def test_bedrock_retrieval_failure_returns_500(self, mock_table, mock_runtime, mock_agent,
                                                    api_gateway_event, lambda_context):
        """Bedrock KB retrieval failure should return 500 with generic error."""
        from query_handler.index import handler

        mock_agent.retrieve.side_effect = ClientError(
            {'Error': {'Code': 'ValidationException', 'Message': 'KB not found'}},
            'Retrieve'
        )

        event = api_gateway_event({'question': 'What services does Rome offer?'})
        response = handler(event, lambda_context)

        assert response['statusCode'] == 500
        body = json.loads(response['body'])
        assert 'error' in body
        # Should NOT expose internal error details to user
        assert 'KB not found' not in body['error']

    @patch('query_handler.index.bedrock_agent')
    @patch('query_handler.index.bedrock_runtime')
    @patch('query_handler.index.table')
    def test_model_invocation_failure_returns_500(self, mock_table, mock_runtime, mock_agent,
                                                   api_gateway_event, lambda_context,
                                                   mock_bedrock_retrieval_response):
        """Bedrock model invocation failure should return 500."""
        from query_handler.index import handler

        mock_agent.retrieve.return_value = mock_bedrock_retrieval_response
        mock_runtime.invoke_model.side_effect = ClientError(
            {'Error': {'Code': 'ThrottlingException', 'Message': 'Too many tokens'}},
            'InvokeModel'
        )

        event = api_gateway_event({'question': 'What services does Rome offer?'})
        response = handler(event, lambda_context)

        assert response['statusCode'] == 500
        body = json.loads(response['body'])
        assert 'error' in body

    @patch('query_handler.index.bedrock_agent')
    @patch('query_handler.index.bedrock_runtime')
    @patch('query_handler.index.table')
    def test_dynamodb_failure_does_not_break_response(self, mock_table, mock_runtime, mock_agent,
                                                       api_gateway_event, lambda_context,
                                                       mock_bedrock_retrieval_response,
                                                       mock_bedrock_model_response):
        """DynamoDB logging failure should not prevent response delivery."""
        from query_handler.index import handler

        mock_agent.retrieve.return_value = mock_bedrock_retrieval_response
        mock_runtime.invoke_model.return_value = mock_bedrock_model_response
        mock_table.put_item.side_effect = Exception('DynamoDB connection timeout')

        event = api_gateway_event({'question': 'What services does Rome offer?'})
        response = handler(event, lambda_context)

        # Should still return 200 — analytics failure is non-fatal
        assert response['statusCode'] == 200
        body = json.loads(response['body'])
        assert 'answer' in body

    @patch('query_handler.index.bedrock_agent')
    @patch('query_handler.index.bedrock_runtime')
    @patch('query_handler.index.table')
    def test_unexpected_exception_returns_500(self, mock_table, mock_runtime, mock_agent,
                                              api_gateway_event, lambda_context):
        """Unexpected exceptions should return 500 with generic message."""
        from query_handler.index import handler

        mock_agent.retrieve.side_effect = RuntimeError('Something unexpected')

        event = api_gateway_event({'question': 'What services does Rome offer?'})
        response = handler(event, lambda_context)

        assert response['statusCode'] == 500
        body = json.loads(response['body'])
        assert 'error' in body
        # Should not expose internal details
        assert 'Something unexpected' not in body['error']


class TestHelperFunctions:
    """Test helper functions in the query handler."""

    def test_format_context_with_chunks(self, mock_bedrock_retrieval_response):
        """format_context should format chunks with source URIs."""
        from query_handler.index import format_context

        chunks = mock_bedrock_retrieval_response['retrievalResults']
        result = format_context(chunks)

        assert '02-rome-services.md' in result
        assert 'Rome offers AI and RAG' in result

    def test_format_context_empty_returns_no_context(self):
        """format_context with empty chunks should return fallback message."""
        from query_handler.index import format_context

        result = format_context([])
        assert 'No relevant context found' in result

    def test_format_sources(self, mock_bedrock_retrieval_response):
        """format_sources should extract document names and excerpts."""
        from query_handler.index import format_sources

        chunks = mock_bedrock_retrieval_response['retrievalResults']
        sources = format_sources(chunks)

        assert len(sources) == 3
        assert sources[0]['document'] == '02-rome-services.md'
        assert 'excerpt' in sources[0]
