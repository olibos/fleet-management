# Fleet Management System
[![Quality gate](https://sonarcloud.io/api/project_badges/quality_gate?project=olibos_fleet-management)](https://sonarcloud.io/summary/new_code?id=olibos_fleet-management)

Welcome to the Fleet Management System project, an R&D initiative exploring the capabilities of Astro with cutting-edge features such as actions.

This project change from the typical "Hello World" application by utilizing the practical scenario of managing a company's car fleet.

Our goal is to demonstrate the versatility and potential of Astro in a real-world context, providing a glimpse into the future of fleet management.

## Getting started
- Clone the repository
- Install dependencies
    ```bash
    yarn
    ```
- Fill the `.env` file with at least the following variables:
    ```env
    MSAL_APPLICATION_ID=00000000-0000-0000-0000-000000000000
    MSAL_APPLICATION_TENANT_ID=00000000-0000-0000-0000-000000000000
    MSAL_APPLICATION_SECRET=your_secret_here
    JWT_SECRET="your_secret_here"
    SITE=https://your_site_here/
    ```
- Run
    ```bash
    yarn run
    ```