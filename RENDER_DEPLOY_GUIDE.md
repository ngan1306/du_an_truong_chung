# Deploy frontend on Render

The frontend Docker image serves the React app with Nginx. It listens on Render's
`PORT` (default `10000`) and sends `/api` requests to the backend URL configured
by `API_PROXY_URL`.

## Configure the Render frontend service

1. Keep the service runtime as **Docker**, with `frontend` as the root directory
   and `Dockerfile` as the Dockerfile path. Leave the Docker command empty so
   Render uses the image's Nginx command.
2. Copy the backend service's public `onrender.com` URL from its service page.
3. In the frontend service's **Environment** settings, add:

   ```text
   API_PROXY_URL=https://<backend-service>.onrender.com
   ```

   Replace the placeholder with the backend URL from step 2. Do not add `/api`
   or a trailing slash; Nginx forwards the original `/api/...` path.
4. Deploy the frontend again.

Using the public backend URL also works when the backend plan cannot receive
private network traffic. Render documents public service URLs in
[web services](https://render.com/docs/web-services).

The Docker Compose configurations set `API_PROXY_URL` to `http://backend:5000`
for their shared Compose network, so this Render setting is only needed for the
separately deployed Render services.
