# Fluvial Chat App

This project illustrates Fluvial's basic usage through a semi-sophisticated chatroom app.

To run this sample locally, you will need to create a `.cert` folder in the project root and then generate a certificate and key.  The [readme for Fluvial](https://www.npmjs.com/package/fluvial) has the command for openssl that was run while developing and presenting this example.

You can run the front-end by entering the `client` folder and running `npm run dev`.  The back-end can be run by simply running it with `node index.js`.  For extra credit (despite no class that phrase would be relevant for), you could even use fluvial's `serveFile` and `serveFiles` to serve up the built front-end files; for the purposes of this sample, it wasn't set up to do that.

This stack includes Vue for the front-end (using pinia as a data store) and Fluvial for the back-end.  No database was harmed in the making of this sample.  Since the example was mostly to showcase Fluvial, the server-side file structure is found directly in the root of the project whereas the `client` folder contains all of the client-side code.

NOTE:  This example is very simplistic as far as a feature set is concerned and only took two days to put together, so put your judgment back where it came from and leave it there.

## Highlights

### `EventSource` usage

In `client/src/stores/messages-store.js`, you will find an `EventSource` object being constructed in the `listenForMessages` action.  This calls the endpoint registered at the beginning of the `routers/messages.router.js` file (the endpoint whose path ends in `/stream`).  This means that each chat message sent and created on the server is immediately pushed to the front-end after being stored.

Though HTTP/1.x does support `EventSource`s, there are concurrent connection limitations enforced in HTTP/1.x that can't be as easily overcome and causes persistent connections such as the `EventSource` uses to encroach on the limits.  HTTP/2 does not suffer from the much more limited connection counts and can use multiplexing to reduce the amount of separate connections altogether.
