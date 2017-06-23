# RUN ACTION
--------------

### Request

    POST /api/v1/actions/:action_id

```javascript
{
    "data": {
        ...
    }
}
```

#### Restore password

```javascript

    {
        "data": {
            "password": "password",
            "confirmPassword" : "password"
        }
    }

```

#### Confirm new email

```javascript

    {
        "data": {
            "email" : "petro@mail.com"
        }
    }

```

### Response

```javascript
{
    "status": 1                           // integer, 1 if action was successful, else 0
}
```