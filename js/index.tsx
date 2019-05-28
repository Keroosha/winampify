import * as Sentry from "@sentry/browser";
import "babel-polyfill";
import React from "react";
import { render } from "react-dom";
import { Provider } from "react-redux";
import { persistStore } from "redux-persist";
import { PersistGate } from "redux-persist/integration/react";
import "../css/line-scale.css";
import Winampify from "./components";
import store from "./store";

Sentry.init({
  dsn: "https://6ee628e2853b493ca3872c3b9daf766d@sentry.io/1469964"
});

// tslint:disable-next-line: no-console
console.log(`ENV = ${process.env.NODE_ENV}`);

export const persistor = persistStore(store);

render(
  <Provider store={store}>
    <PersistGate loading={null} persistor={persistor}>
      <Winampify />
    </PersistGate>
  </Provider>,
  document.getElementById("app")
);
