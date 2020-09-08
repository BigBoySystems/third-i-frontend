Third-I frontend
================

This project was bootstrapped with
[Create React App](https://github.com/facebook/create-react-app).

Prerequisites
-------------

 *  node >= 8.17.0, npm >= 6.13.4

Installation
------------

```
npm install
```

Run development server
----------------------

```
npm run start
```

The application will be available on http://localhost:3000. It will try to use
http://localhost:8000 for the backend but it will use a mock if it is not
available.

Bundle for production
---------------------

```
npm run build
```

You can also make a production bundle that uses mock backend with:

```
REACT_APP_MOCK_API=true npm run build
```

This is useful if you want to share the frontend using https://tunnelto.dev/
