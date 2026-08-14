# IAM Security Services

## The Problem Rome Solves

Identity and Access Management (IAM) is one of the most neglected areas of cloud security. When employees leave a company, their access to AWS, GitHub, databases, and SaaS tools is often not revoked for months — or ever. This creates serious security and compliance risks.

Rome specializes in fixing this problem and building systems that prevent it from happening again.

## The Real Risk

When an employee leaves without proper offboarding:
- They may still have access to production AWS environments
- They may still be able to read or modify customer data
- Their credentials may be used months later in a breach
- Your company may fail security audits (SOC 2, ISO 27001, HIPAA)

This is not theoretical — it is one of the most common causes of cloud security incidents.

## IAM Audit Services

Rome conducts comprehensive IAM audits across your entire infrastructure:

**AWS IAM Audit**
- Inventory all IAM users, roles, and policies
- Identify unused credentials (90+ days inactive)
- Flag overly permissive policies (AdministratorAccess, *)
- Review cross-account trust relationships
- Check for root account usage

**GitHub Access Audit**
- Inventory all repository collaborators
- Identify former employee access
- Review team memberships and permissions
- Check for exposed secrets in repositories

**SaaS Tool Audit**
- Map access across common tools (Slack, Notion, Figma, AWS Console)
- Identify accounts that should have been deprovisioned
- Generate an offboarding checklist

## Offboarding Automation

Rome builds automated offboarding systems that revoke access the moment an employee is marked as departed:

- Remove IAM users and access keys
- Deactivate GitHub access
- Revoke SaaS tool licenses
- Generate a deprovisioning audit trail
- Send confirmation to HR and security teams

## Least-Privilege Implementation

Rome redesigns IAM policies to follow the principle of least privilege — every user and service gets only the permissions it needs, nothing more.

**Process**
1. Analyze actual permission usage via AWS Access Analyzer
2. Generate minimal permission policies
3. Replace wildcard policies with specific resource ARNs
4. Implement permission boundaries for developer accounts
5. Set up automated drift detection

## Compliance Reporting

Rome generates compliance-ready reports for security audits:
- SOC 2 access control evidence
- ISO 27001 access management documentation
- HIPAA minimum necessary access reports
- Custom audit reports for internal security reviews

## AWS Organizations and SCPs

For organizations with multiple AWS accounts, Rome implements governance at scale:
- Service Control Policies (SCPs) to enforce security guardrails
- AWS Organizations for account management
- Centralized logging and compliance monitoring
- Account vending machine for new team accounts

## Quarterly Access Reviews

Rome offers ongoing access review programs:
- Quarterly review of all user access
- Manager attestation workflows
- Automated removal of unattested access
- Trend reporting and risk scoring

## Contact

To audit and improve your IAM security posture, contact Rome at info@romecity.dev or visit romecity.dev.
