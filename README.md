# Rize CLI

A CLI to provision the necessary components to run a banking application using Rize, which includes:

- Database - (MySQL or Postgres)
- Auth/Identity Provider - (Auth0 or AWS Cognito User Pools)
- Account Auth Provider - (Plaid)
- Middleware API - used to communicate with the Rize API securely

All of these will be run on Docker containers, which makes environments consistent and isolated from other apps regardless of where the app is deployed.

## Prerequisites

- NodeJS v12 and up
  - Check [nvm](https://github.com/creationix/nvm) to manage multiple versions of node/npm on your local
- [Docker Desktop](https://www.docker.com/products/docker-desktop)
- Rize credentials
  - Program UID
  - HMAC
  - Rize Message Queue Username, Password, Topic and Hosts
- (Optional but recommended) Either an [Auth0](https://auth0.com/) account or an [AWS Cognito User Pool](https://docs.aws.amazon.com/cognito/latest/developerguide/cognito-user-identity-pools.html)
- (Optional but recommended) [Plaid](https://plaid.com/) account

## Getting Started

1. [Log in to GitHub Package Registry](#logging-in-to-the-github-package-registry)

2. Install the `@rizefinance/cli` package 

   ```sh
   npm i -g @rizefinance/cli
   ```

3. Create and run a new app

   ```sh
   rize create my-project
   cd my-project
   docker-compose up
   ```

## Logging in to the GitHub Package Registry

1. Run `npm login --scope=@rizefinance --registry=https://npm.pkg.github.com`
2. Input your GitHub Username.
3. For the Password, input your [GitHub Personal Access Token](https://docs.github.com/en/github/authenticating-to-github/creating-a-personal-access-token). Your token should have the following scopes/permissions: `repo`, `read:packages`
4. Input the email address that you're using in GitHub.

## CLI Options

- `--db`, `--database` - Create a database for your app.
- `--auth`, `--authentication` - Setup the authentication provider for your app.

## Recommended Auth0 Configurations

- **Application**
  - It must have a front-end application (not Machine to Machine). Its **Client ID** will be the one that you should provide when creating the app using `rize create`.
  - The `Password` grant must be enabled for the front-end application (**Advanced Settings** > **Grant Types** > **Password**). Other grant types can also be used (customization of the actual frontend app might be needed).
- **APIs**
  - It must have a custom API. Its **Identifier** will be the one that you should provide as the **Audience** when creating the app using `rize create`.
- **Settings**
  - Set **API Authorization Settings** > **Default Directory** to `Username-Password-Authentication`

## Recommended AWS Cognito User Pool Configurations

- **App clients**
  - Don't generate a client secret when creating an app client.
- **Assign a domain name**
  - Under **App integration**, select **Domain name**. You can assign an Amazon Cognito domain, or use your own domain.
- **Attributes**
  - Require `email` under `Which standard attributes are required?
    `
- **Message customizations**
  - Select `Link` for `Do you want to customize your email verification messages?`