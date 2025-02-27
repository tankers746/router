import {
  getActionFromState,
  getStateFromPath,
  NavigationContainerRefContext,
} from "@react-navigation/core";
import { LinkingContext } from "@react-navigation/native";
import * as Linking from "expo-linking";
import * as React from "react";

function isRemoteHref(href: string): boolean {
  return /:\/\//.test(href);
}

export function useLinkToPath() {
  const navigation = React.useContext(NavigationContainerRefContext);
  const linking = React.useContext(LinkingContext);

  const linkTo = React.useCallback(
    (to: string, event?: string) => {
      if (isRemoteHref(to)) {
        Linking.openURL(to);
        return;
      }

      if (navigation === undefined) {
        throw new Error(
          "Couldn't find a navigation object. Is your component inside NavigationContainer?"
        );
      }

      const { options } = linking;

      const state = options?.getStateFromPath
        ? options.getStateFromPath(to, options.config)
        : getStateFromPath(to, options?.config);

      if (state) {
        const action = getActionFromState(state, options?.config);

        if (action !== undefined) {
          if (event) {
            // @ts-ignore
            action.type = event;
          }
          navigation.dispatch(action);
        } else {
          navigation.reset(state);
        }
      } else {
        throw new Error("Failed to parse the path to a navigation state.");
      }
    },
    [linking, navigation]
  );

  return linkTo;
}
