# storefront-gotrue-auth

## Why?

Gotrue sends the email recovery link only for one route. And when it is used for multiple instances of different websites, we have a problem.

For this reason, a recovery view was created to centralize password recovery regardless of the user's site.

## Enviroments

```
VUE_APP_GOTRUE_HOST=https://yourgotrue # your gotrue host
```
## Project setup
```
npm install
```

### Compiles and hot-reloads for development
```
npm run serve
```

### Compiles and minifies for production
```
npm run build
```

### Lints and fixes files
```
npm run lint
```