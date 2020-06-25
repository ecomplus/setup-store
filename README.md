[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)
[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](https://www.gnu.org/licenses/gpl-3.0)

# storefront-ci
Automated tasks for default Storefront setup and first deploy

## Features

  - Create repository on github
  - Commit configuration codes
  - Create a user on Gotrue
  - Creates an instance for the user on Git Gateway
  - Creates the website on Netlify

## Development

Fork/Clone this repository and install dependencies

```bash
git clone https://github.com/ecomplus/storefront-ci.git
cd storefront-ci
npm i
```

To start storefront-ci execute:

```bash
npm start
```

After starting storefront-ci, it will be online at http://127.0.0.1:4000

To define cutom port, see [enviroments](#)

## Enviroments
  It's necessary to configure enviroments to good work this service.

  It's enviroments to be stay in `.env` file, see enviroment options

```bash
  STOREFRONT_CI_PORT=4000 # To make a custom port
```

```bash
STOREFRONT_CI_JWT_TOKEN=XXXXXXX
```
> It's a token used to create instance in Git Gateway. It's to be same configured in `GITGATEWAY_JWT_SECRET`  on Git Gateway environments and `GOTRUE_JWT_SECRET` on Gotrue environments

```bash
STOREFRONT_CI_OPERATOR_TOKEN=xxxxxxxxxx
```
> It's operator token with permission to create an instance in Git Gateway. IT's to be the same configured in `GITGATEWAY_OPERATOR_TOKEN` on Git Gateway enviroments

```bash
STOREFRONT_CI_GITHUB_TOKEN=xxxxxxxxxx
```
> It's the Github token with permission to create and commit repositorys

```bash
STOREFRONT_CI_GITHUB_TEMPLATE_OWNER=ecomplus
```
> It's a repository template owner

```bash
STOREFRONT_CI_GITHUB_TEMPLATE_REPO=storefront-starter
```
> It's a repository template name used to create a new repository

```bash
STOREFRONT_CI_GITHUB_DEFAULT_OWNER=storefront-ci
```
> It's a owner to new repository generated

```bash
STOREFRONT_CI_GOTRUE_URL=https://mygotrue
```
> It's a custom Gotrue url

```bash
STOREFRONT_CI_GOTRUE_USERNAME=YOUR_GOTRUE_USERNAME
```
> It's a username used to authenticatee on gotrue

```bash
STOREFRONT_CI_GOTRUE_PASSWORD=YOUR_GOTRUE_PASSWORD
```
> It's a password used to authenticatee on gotrue

```bash
STOREFRONT_CI_GITGATEWAY_URL=https://mygitgateway
```
> It's a custom Git Gateway url

```bash
STOREFRONT_CI_NETLIFY_URL=https://api.netlify.com/api/v1/
```
> It's a netlify api url

```bash
STOREFRONT_CI_NETLIFY_TOKEN=xxxxxxxxxx
```
> It's the Netlify token with permission to create sites

```bash
STOREFRONT_CI_NETLIFY_GITHUB_INSTALATION_ID=xxxxxxxxxx
```
> It is the installation ID of the netlify application on github.
As we did not find an easy way to obtain this ID, we created a test repository and deployed it manually on the netlify website. After doing this, consume `https://api.netlify.com/api/v1/sites` using the netlify token, so that the sites created and the github installation number are returned via `instalation_id`

```bash
STOREFRONT_CI_NETLIFY_BRANCH=dist
```
> It's the brach to Netlify listening your commits to make a deploy. `dist` it's default value

```bash
STOREFRONT_CI_NETLIFY_PROVIDER=github
```
> It's the provider to Netlify. `github` it's default value.
> In this moment, storefront-ci works only with github repositorys


## Endpoints

storefront-ci exposes the endpoint (settings is bypass to `/content/settings.json`):

**POST /deploy**

This endpoint does:
  - Generated repository based other template
  - Commit initial settings in repository
  - Created user in Gotrue
  - Created instance in Gitgateway
  - Created site in Netlify

  Body:

  ```json
  {
    "name": "repository name",
    "gotrue": {
      "store_id": "9999",
      "name": "username",
      "email": "user3@user.com",
      "password": "xxxxx",
    },
    "settings": {
      "store_id": "9999",
      "..."
    },
  }
  ```
