"""
Rome AI Agent — Slack Notifier Lambda
Receives SNS alarm notifications and posts to a Slack webhook.
"""

import json
import os
import urllib.request
import logging

logger = logging.getLogger()
logger.setLevel(logging.INFO)

SLACK_WEBHOOK_URL = os.environ['SLACK_WEBHOOK_URL']
ENVIRONMENT = os.environ.get('ENVIRONMENT', 'dev')


def handler(event, context):
    """Process SNS notification and post to Slack."""
    for record in event.get('Records', []):
        sns_message = record.get('Sns', {})
        subject = sns_message.get('Subject', 'Rome Agent Alert')
        message = sns_message.get('Message', '')

        # Try to parse CloudWatch alarm format
        try:
            alarm_data = json.loads(message)
            alarm_name = alarm_data.get('AlarmName', 'Unknown')
            new_state = alarm_data.get('NewStateValue', 'Unknown')
            reason = alarm_data.get('NewStateReason', 'No reason provided')

            # Color: red for ALARM, green for OK
            color = '#dc3545' if new_state == 'ALARM' else '#28a745'
            emoji = ':rotating_light:' if new_state == 'ALARM' else ':white_check_mark:'

            slack_payload = {
                'attachments': [{
                    'color': color,
                    'blocks': [
                        {
                            'type': 'header',
                            'text': {
                                'type': 'plain_text',
                                'text': f'{emoji} {alarm_name} — {new_state}',
                            },
                        },
                        {
                            'type': 'section',
                            'fields': [
                                {'type': 'mrkdwn', 'text': f'*Environment:*\n{ENVIRONMENT}'},
                                {'type': 'mrkdwn', 'text': f'*State:*\n{new_state}'},
                            ],
                        },
                        {
                            'type': 'section',
                            'text': {
                                'type': 'mrkdwn',
                                'text': f'*Reason:*\n{reason}',
                            },
                        },
                    ],
                }],
            }
        except (json.JSONDecodeError, KeyError):
            # Fallback for non-alarm messages
            slack_payload = {
                'text': f'*[{ENVIRONMENT}] {subject}*\n{message}',
            }

        # Post to Slack
        req = urllib.request.Request(
            SLACK_WEBHOOK_URL,
            data=json.dumps(slack_payload).encode('utf-8'),
            headers={'Content-Type': 'application/json'},
            method='POST',
        )

        try:
            with urllib.request.urlopen(req, timeout=5) as response:
                logger.info(f'Slack notification sent: {response.status}')
        except Exception as e:
            logger.error(f'Failed to send Slack notification: {e}')

    return {'statusCode': 200, 'body': 'OK'}
