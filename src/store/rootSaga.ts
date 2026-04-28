import { all } from "redux-saga/effects";
import { authSaga } from "../store/auth/authSaga";

export function* rootSaga() {
  yield all([
    authSaga(),
  ]);
}