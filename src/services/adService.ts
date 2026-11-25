import mobileAds, {
  AppOpenAd,
  InterstitialAd,
  RewardedAd,
  AdEventType,
  RewardedAdEventType,
} from 'react-native-google-mobile-ads';

// Ad Unit IDs (Aapke original Real AdMob Unit IDs)
export const AD_CONFIG = {
  APP_ID: 'ca-app-pub-6300754811006363~4071196153',
  APP_OPEN_ID: 'ca-app-pub-6300754811006363/3671915919',
  REWARDED_ID: 'ca-app-pub-6300754811006363/6720751086',
  INTERSTITIAL_ID: 'ca-app-pub-6300754811006363/6218188201',
};

class AdServiceManager {
  private isInitialized = false;
  private appOpenAd: any = null;
  private interstitialAd: any = null;
  private rewardedAd: any = null;

  private isAppOpenLoaded = false;
  private isInterstitialLoaded = false;
  private isRewardedLoaded = false;

  async init() {
    if (this.isInitialized) return;
    try {
      const adapterStatuses = await mobileAds().initialize();
      this.isInitialized = true;
      console.log('[AdService] Mobile Ads initialized:', adapterStatuses);
      // Preload ads
      this.loadAppOpenAd();
      this.loadInterstitialAd();
      this.loadRewardedAd();
    } catch (e) {
      console.warn('[AdService] Init error:', e);
    }
  }

  // -------------------------------------------------------------
  // 1. APP OPEN ADS (Splash Screen)
  // -------------------------------------------------------------
  loadAppOpenAd() {
    try {
      if (this.appOpenAd) return;
      this.appOpenAd = AppOpenAd.createForAdRequest(AD_CONFIG.APP_OPEN_ID, {
        requestNonPersonalizedAdsOnly: true,
      });

      this.appOpenAd.addAdEventListener(AdEventType.LOADED, () => {
        console.log('[AdService] AppOpenAd Loaded');
        this.isAppOpenLoaded = true;
      });

      this.appOpenAd.addAdEventListener(AdEventType.ERROR, (error: any) => {
        console.warn('[AdService] AppOpenAd Error:', error);
        this.isAppOpenLoaded = false;
        this.appOpenAd = null;
      });

      this.appOpenAd.addAdEventListener(AdEventType.CLOSED, () => {
        console.log('[AdService] AppOpenAd Closed');
        this.isAppOpenLoaded = false;
        this.appOpenAd = null;
        setTimeout(() => this.loadAppOpenAd(), 1000);
      });

      this.appOpenAd.load();
    } catch (err) {
      console.warn('[AdService] loadAppOpenAd exception:', err);
    }
  }

  showAppOpenAd(onDismiss?: () => void) {
    console.log('[AdService] Checking AppOpenAd status: isLoaded =', this.isAppOpenLoaded);
    if (this.appOpenAd && this.isAppOpenLoaded) {
      console.log('[AdService] Showing AppOpenAd now...');
      let dismissed = false;
      const handleDismiss = () => {
        if (!dismissed) {
          dismissed = true;
          onDismiss?.();
          this.loadAppOpenAd();
        }
      };

      const unsubscribeClosed = this.appOpenAd.addAdEventListener(AdEventType.CLOSED, () => {
        console.log('[AdService] AppOpenAd was CLOSED by user');
        unsubscribeClosed();
        handleDismiss();
      });

      const unsubscribeError = (this.appOpenAd as any).addAdEventListener(AdEventType.ERROR, (err: any) => {
        console.warn('[AdService] AppOpenAd Show Error:', err);
        unsubscribeError();
        handleDismiss();
      });

      try {
        this.appOpenAd.show();
      } catch (e) {
        console.warn('[AdService] Error showing AppOpenAd:', e);
        handleDismiss();
      }
    } else {
      console.log('[AdService] AppOpenAd is not loaded yet (or internet slow), skipping ad to not block user');
      onDismiss?.();
    }
  }

  // -------------------------------------------------------------
  // 2. INTERSTITIAL ADS (Settings Click / Transitions)
  // -------------------------------------------------------------
  loadInterstitialAd() {
    try {
      if (this.interstitialAd) return;
      this.interstitialAd = InterstitialAd.createForAdRequest(AD_CONFIG.INTERSTITIAL_ID, {
        requestNonPersonalizedAdsOnly: true,
      });

      this.interstitialAd.addAdEventListener(AdEventType.LOADED, () => {
        console.log('[AdService] InterstitialAd Loaded');
        this.isInterstitialLoaded = true;
      });

      this.interstitialAd.addAdEventListener(AdEventType.ERROR, (error: any) => {
        console.warn('[AdService] InterstitialAd Error:', error);
        this.isInterstitialLoaded = false;
        this.interstitialAd = null;
      });

      this.interstitialAd.addAdEventListener(AdEventType.CLOSED, () => {
        console.log('[AdService] InterstitialAd Closed');
        this.isInterstitialLoaded = false;
        this.interstitialAd = null;
        setTimeout(() => this.loadInterstitialAd(), 1000);
      });

      this.interstitialAd.load();
    } catch (err) {
      console.warn('[AdService] loadInterstitialAd exception:', err);
    }
  }

  showInterstitialAd(onClose?: () => void) {
    if (this.interstitialAd && this.isInterstitialLoaded) {
      let closed = false;
      const handleClose = () => {
        if (!closed) {
          closed = true;
          onClose?.();
        }
      };

      const unsubClosed = this.interstitialAd.addAdEventListener(AdEventType.CLOSED, () => {
        unsubClosed();
        handleClose();
      });
      const unsubError = this.interstitialAd.addAdEventListener(AdEventType.ERROR, () => {
        unsubError();
        handleClose();
      });

      try {
        this.interstitialAd.show();
      } catch (e) {
        console.warn('[AdService] showInterstitialAd error:', e);
        handleClose();
      }
    } else {
      this.loadInterstitialAd();
      onClose?.();
    }
  }

  // -------------------------------------------------------------
  // 3. REWARDED ADS (Bonus coins / user reward)
  // -------------------------------------------------------------
  loadRewardedAd() {
    try {
      if (this.rewardedAd) return;
      this.rewardedAd = RewardedAd.createForAdRequest(AD_CONFIG.REWARDED_ID, {
        requestNonPersonalizedAdsOnly: true,
      });

      this.rewardedAd.addAdEventListener(RewardedAdEventType.LOADED, () => {
        console.log('[AdService] RewardedAd Loaded');
        this.isRewardedLoaded = true;
      });

      this.rewardedAd.addAdEventListener(AdEventType.ERROR, (error: any) => {
        console.warn('[AdService] RewardedAd Error:', error);
        this.isRewardedLoaded = false;
        this.rewardedAd = null;
      });

      this.rewardedAd.addAdEventListener(AdEventType.CLOSED, () => {
        console.log('[AdService] RewardedAd Closed');
        this.isRewardedLoaded = false;
        this.rewardedAd = null;
        setTimeout(() => this.loadRewardedAd(), 1000);
      });

      this.rewardedAd.load();
    } catch (err) {
      console.warn('[AdService] loadRewardedAd exception:', err);
    }
  }

  showRewardedAd(
    onRewarded: (reward: any) => void,
    onDismiss?: () => void,
    onAdNotReady?: () => void
  ) {
    if (this.rewardedAd && this.isRewardedLoaded) {
      let earnedRewardData: any = null;

      const unsubEarned = this.rewardedAd.addAdEventListener(
        RewardedAdEventType.EARNED_REWARD,
        (reward: any) => {
          earnedRewardData = reward;
          onRewarded(reward);
        }
      );

      const unsubClosed = this.rewardedAd.addAdEventListener(AdEventType.CLOSED, () => {
        unsubEarned();
        unsubClosed();
        this.isRewardedLoaded = false;
        this.rewardedAd = null;
        this.loadRewardedAd();
        onDismiss?.();
        if (earnedRewardData) {
          console.log('[AdService] User earned reward:', earnedRewardData);
        }
      });

      const unsubError = this.rewardedAd.addAdEventListener(AdEventType.ERROR, (err: any) => {
        unsubEarned();
        unsubError();
        this.isRewardedLoaded = false;
        this.rewardedAd = null;
        this.loadRewardedAd();
        onDismiss?.();
      });

      try {
        this.rewardedAd.show();
      } catch (e) {
        console.warn('[AdService] showRewardedAd error:', e);
        this.isRewardedLoaded = false;
        this.rewardedAd = null;
        this.loadRewardedAd();
        onDismiss?.();
      }
    } else {
      console.log('[AdService] RewardedAd not loaded yet, loading now...');
      this.loadRewardedAd();
      if (onAdNotReady) {
        onAdNotReady();
      } else {
        onDismiss?.();
      }
    }
  }

  isRewardedReady() {
    return this.isRewardedLoaded;
  }

  isInterstitialReady() {
    return this.isInterstitialLoaded;
  }

  isAppOpenReady() {
    return this.isAppOpenLoaded;
  }
}

export const AdService = new AdServiceManager();
export default AdService;
