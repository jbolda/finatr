# Tauri App

## developing

Start the finatr server with `yarn start`, and run the Tauri development mode with `yarn tauri dev`.

## production build

Create a production build of finatr with `yarn build` and create a release version with `yarn tauri build`. Cross compilation is currently not possible so you can only build for the operating system you are building on.

## app release

We are using Github Actions to build an app for each of Windows, Mac and Linux. It is attached to a release when the package.json version is bumped.
