# Storefront CI

Automated tasks for default Storefront setup and first deploy

## Endpoints

#### `POST /deploy`

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

> `settings` is bypassed to `/content/settings.json`
