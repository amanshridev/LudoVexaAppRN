import React from 'react';
import { Image } from 'react-native';
import Svg, {
  Path,
  Circle,
  Rect,
  G,
  Defs,
  LinearGradient,
  RadialGradient,
  Stop,
  Polygon,
} from 'react-native-svg';

// ==========================================
// 1. BRAND & LOGO VECTOR ASSETS
// ==========================================

export const CrownIcon = ({ size = 28, color = '#F59E0B' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Defs>
      <LinearGradient id="crownGrad" x1="0" y1="0" x2="1" y2="1">
        <Stop offset="0%" stopColor="#FDE047" />
        <Stop offset="50%" stopColor="#F59E0B" />
        <Stop offset="100%" stopColor="#D97706" />
      </LinearGradient>
    </Defs>
    <Path
      d="M2 19h20v2H2v-2zm1-5l2.5-7 5.5 5 5.5-5 2.5 7H3zm13.5-8a1.5 1.5 0 110-3 1.5 1.5 0 010 3zm-5.5 0a1.5 1.5 0 110-3 1.5 1.5 0 010 3zm-5.5 0a1.5 1.5 0 110-3 1.5 1.5 0 010 3z"
      fill="url(#crownGrad)"
    />
  </Svg>
);

export const LudoVexaLogo = ({ size = 220 }) => (
  <Image
    source={require('../../assets/images/logo.png')}
    style={{ width: size, height: size, borderRadius: 28 }}
    resizeMode="contain"
  />
);


// ==========================================
// 2. PAWNS & DICE GRAPHIC (SPLASH & HERO)
// ==========================================

export const PawnsGraphic = ({ size = 160 }) => (
  <Svg width={size} height={size * 0.75} viewBox="0 0 180 135" fill="none">
    <Defs>
      <LinearGradient id="pRed" x1="0" y1="0" x2="1" y2="1">
        <Stop offset="0%" stopColor="#F87171" />
        <Stop offset="100%" stopColor="#B91C1C" />
      </LinearGradient>
      <LinearGradient id="pGreen" x1="0" y1="0" x2="1" y2="1">
        <Stop offset="0%" stopColor="#34D399" />
        <Stop offset="100%" stopColor="#047857" />
      </LinearGradient>
      <LinearGradient id="pYellow" x1="0" y1="0" x2="1" y2="1">
        <Stop offset="0%" stopColor="#FDE047" />
        <Stop offset="100%" stopColor="#B45309" />
      </LinearGradient>
      <LinearGradient id="pBlue" x1="0" y1="0" x2="1" y2="1">
        <Stop offset="0%" stopColor="#60A5FA" />
        <Stop offset="100%" stopColor="#1D4ED8" />
      </LinearGradient>
      <RadialGradient id="diceShadow" cx="50%" cy="50%" r="50%">
        <Stop offset="0%" stopColor="rgba(0,0,0,0.6)" />
        <Stop offset="100%" stopColor="transparent" />
      </RadialGradient>
    </Defs>

    {/* Green Pawn (Left Background) */}
    <G transform="translate(18, 24)">
      <Circle cx="20" cy="14" r="12" fill="url(#pGreen)" stroke="#A7F3D0" strokeWidth="1" />
      <Path d="M10 25 C12 36 8 58 5 68 L35 68 C32 58 28 36 30 25 Z" fill="url(#pGreen)" />
      <Rect x="2" y="65" width="36" height="8" rx="4" fill="#064E3B" />
    </G>

    {/* Red Pawn (Front-Left) */}
    <G transform="translate(48, 12)">
      <Circle cx="20" cy="15" r="13" fill="url(#pRed)" stroke="#FECACA" strokeWidth="1" />
      <Path d="M10 26 C12 36 7 58 4 72 L36 72 C33 58 28 36 30 26 Z" fill="url(#pRed)" />
      <Rect x="0" y="68" width="40" height="9" rx="4.5" fill="#7F1D1D" />
    </G>

    {/* Yellow Pawn (Front-Right) */}
    <G transform="translate(88, 12)">
      <Circle cx="20" cy="15" r="13" fill="url(#pYellow)" stroke="#FEF08A" strokeWidth="1" />
      <Path d="M10 26 C12 36 7 58 4 72 L36 72 C33 58 28 36 30 26 Z" fill="url(#pYellow)" />
      <Rect x="0" y="68" width="40" height="9" rx="4.5" fill="#78350F" />
    </G>

    {/* Blue Pawn (Right Background) */}
    <G transform="translate(118, 24)">
      <Circle cx="20" cy="14" r="12" fill="url(#pBlue)" stroke="#BFDBFE" strokeWidth="1" />
      <Path d="M10 25 C12 36 8 58 5 68 L35 68 C32 58 28 36 30 25 Z" fill="url(#pBlue)" />
      <Rect x="2" y="65" width="36" height="8" rx="4" fill="#1E3A8A" />
    </G>

    {/* 3D Dice Shadow */}
    <Circle cx="90" cy="115" r="26" fill="url(#diceShadow)" />

    {/* 3D Center Dice in foreground */}
    <G transform="translate(70, 70)">
      <Rect x="0" y="0" width="40" height="40" rx="10" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="2.5" />
      <Circle cx="11" cy="11" r="3.2" fill="#0F172A" />
      <Circle cx="29" cy="11" r="3.2" fill="#0F172A" />
      <Circle cx="20" cy="20" r="4.2" fill="#EF4444" />
      <Circle cx="11" cy="29" r="3.2" fill="#0F172A" />
      <Circle cx="29" cy="29" r="3.2" fill="#0F172A" />
    </G>
  </Svg>
);

// ==========================================
// 3. CURATED VECTOR COIN & CURRENCY ASSETS
// ==========================================

export const CoinIcon = ({ size = 20 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Defs>
      <LinearGradient id="coinGrad" x1="0" y1="0" x2="1" y2="1">
        <Stop offset="0%" stopColor="#FDE047" />
        <Stop offset="50%" stopColor="#F59E0B" />
        <Stop offset="100%" stopColor="#B45309" />
      </LinearGradient>
      <LinearGradient id="innerCoin" x1="0" y1="0" x2="1" y2="1">
        <Stop offset="0%" stopColor="#FBBF24" />
        <Stop offset="100%" stopColor="#D97706" />
      </LinearGradient>
    </Defs>
    <Circle cx="12" cy="12" r="10" fill="url(#coinGrad)" stroke="#FEF08A" strokeWidth="1.5" />
    <Circle cx="12" cy="12" r="7" fill="url(#innerCoin)" stroke="#F59E0B" strokeWidth="1" />
    <Path
      d="M10 8h4a2 2 0 012 2v0a2 2 0 01-2 2h-4v-4zm0 4h4.5a2 2 0 012 2v0a2 2 0 01-2 2H10v-4z"
      fill="#FEF3C7"
    />
  </Svg>
);

export const CoinPackVector = ({ tier = 1, size = 48 }) => {
  if (tier === 1) {
    // 100 Coins Stack
    return (
      <Svg width={size} height={size} viewBox="0 0 48 48" fill="none">
        <Circle cx="24" cy="32" r="12" fill="#D97706" stroke="#FDE047" strokeWidth="2" />
        <Circle cx="24" cy="24" r="12" fill="#F59E0B" stroke="#FEF08A" strokeWidth="2" />
        <Circle cx="24" cy="16" r="12" fill="#FBBF24" stroke="#FFFFFF" strokeWidth="2" />
        <Circle cx="24" cy="16" r="8" fill="#FDE047" />
        <Path d="M22 13h4v6h-4z" fill="#78350F" />
      </Svg>
    );
  }
  if (tier === 2) {
    // 500 Coins Pouch
    return (
      <Svg width={size} height={size} viewBox="0 0 48 48" fill="none">
        <Path d="M12 20c0-6 4-10 12-10s12 4 12 10c0 12-4 20-12 20s-12-8-12-20z" fill="#B45309" stroke="#F59E0B" strokeWidth="2" />
        <Rect x="18" y="16" width="12" height="4" rx="2" fill="#FDE047" />
        <Circle cx="24" cy="28" r="6" fill="#F59E0B" stroke="#FDE047" strokeWidth="1.5" />
      </Svg>
    );
  }
  if (tier === 3) {
    // 1500 Coins Bag
    return (
      <Svg width={size} height={size} viewBox="0 0 48 48" fill="none">
        <Path d="M10 22c0-8 6-12 14-12s14 4 14 12c0 14-5 20-14 20s-14-6-14-20z" fill="#78350F" stroke="#FBBF24" strokeWidth="2" />
        <Path d="M16 14h16l-3 4H19l-3-4z" fill="#EF4444" />
        <Circle cx="24" cy="28" r="7" fill="#F59E0B" stroke="#FDE047" strokeWidth="1.5" />
        <Path d="M22 25h4a2 2 0 012 2v2a2 2 0 01-2 2h-4v-6z" fill="#78350F" />
      </Svg>
    );
  }
  if (tier === 4) {
    // 3500 Coins Wooden Chest
    return (
      <Svg width={size} height={size} viewBox="0 0 48 48" fill="none">
        <Rect x="8" y="18" width="32" height="22" rx="4" fill="#B45309" stroke="#FDE047" strokeWidth="2" />
        <Path d="M8 20c0-6 7-10 16-10s16 4 16 10H8z" fill="#78350F" stroke="#FDE047" strokeWidth="2" />
        <Rect x="21" y="24" width="6" height="8" rx="2" fill="#FDE047" />
        <Circle cx="24" cy="27" r="1.5" fill="#1E293B" />
      </Svg>
    );
  }
  // 8000 Coins Royal Chest Vault
  return (
    <Svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <Rect x="6" y="18" width="36" height="24" rx="5" fill="#1E3A8A" stroke="#FDE047" strokeWidth="2.5" />
      <Path d="M6 20c0-7 8-12 18-12s18 5 18 12H6z" fill="#2563EB" stroke="#FDE047" strokeWidth="2" />
      <Rect x="20" y="24" width="8" height="10" rx="3" fill="#FDE047" />
      <Circle cx="24" cy="28" r="2" fill="#EF4444" />
      <Circle cx="12" cy="30" r="3" fill="#FDE047" />
      <Circle cx="36" cy="30" r="3" fill="#FDE047" />
    </Svg>
  );
};

// ==========================================
// 4. DAY 7 GLOWING TREASURE CHEST (DAILY REWARD)
// ==========================================

export const GlowingTreasureChestVector = ({ size = 64 }) => (
  <Svg width={size} height={size} viewBox="0 0 80 80" fill="none">
    <Defs>
      <RadialGradient id="chestGlow" cx="50%" cy="50%" r="50%">
        <Stop offset="0%" stopColor="#FDE047" stopOpacity="0.8" />
        <Stop offset="70%" stopColor="#F59E0B" stopOpacity="0.3" />
        <Stop offset="100%" stopColor="transparent" />
      </RadialGradient>
      <LinearGradient id="chestGold" x1="0" y1="0" x2="1" y2="1">
        <Stop offset="0%" stopColor="#FEF08A" />
        <Stop offset="50%" stopColor="#F59E0B" />
        <Stop offset="100%" stopColor="#B45309" />
      </LinearGradient>
    </Defs>
    {/* Radiant Background Aura */}
    <Circle cx="40" cy="40" r="38" fill="url(#chestGlow)" />

    {/* Light Starbursts */}
    <Path d="M40 4L42 20L40 40L38 20Z" fill="#FEF08A" opacity="0.6" />
    <Path d="M40 76L42 60L40 40L38 60Z" fill="#FEF08A" opacity="0.6" />
    <Path d="M4 40L20 42L40 40L20 38Z" fill="#FEF08A" opacity="0.6" />
    <Path d="M76 40L60 42L40 40L60 38Z" fill="#FEF08A" opacity="0.6" />

    {/* Golden Gift/Chest Box */}
    <Rect x="16" y="34" width="48" height="34" rx="6" fill="url(#chestGold)" stroke="#FFFBEB" strokeWidth="2" />
    <Rect x="12" y="24" width="56" height="14" rx="4" fill="#FDE047" stroke="#B45309" strokeWidth="1.5" />
    {/* Ribbon */}
    <Rect x="36" y="24" width="8" height="44" fill="#EF4444" />
    {/* Ribbon Bow */}
    <Path d="M40 24C34 14 26 18 32 24zm0 0c6-10 14-6 8 0z" fill="#EF4444" stroke="#B91C1C" strokeWidth="1" />
  </Svg>
);

// ==========================================
// 5. INVITE FRIENDS VECTOR ILLUSTRATION
// ==========================================

export const InviteFriendsIllustration = ({ size = 150 }) => (
  <Svg width={size} height={size * 0.9} viewBox="0 0 160 144" fill="none">
    <Defs>
      <LinearGradient id="friendSkin" x1="0" y1="0" x2="1" y2="1">
        <Stop offset="0%" stopColor="#FED7AA" />
        <Stop offset="100%" stopColor="#FDBA74" />
      </LinearGradient>
      <LinearGradient id="giftFriendGrad" x1="0" y1="0" x2="1" y2="1">
        <Stop offset="0%" stopColor="#F43F5E" />
        <Stop offset="100%" stopColor="#BE123C" />
      </LinearGradient>
    </Defs>

    {/* Confetti particles */}
    <Circle cx="20" cy="24" r="3" fill="#FDE047" />
    <Circle cx="44" cy="12" r="2.5" fill="#38BDF8" />
    <Circle cx="120" cy="18" r="3" fill="#34D399" />
    <Circle cx="140" cy="30" r="2.5" fill="#F43F5E" />
    <Circle cx="132" cy="70" r="2" fill="#FDE047" />
    <Circle cx="24" cy="65" r="2" fill="#A855F7" />

    {/* Left Friend (Boy with Blue shirt) */}
    <G transform="translate(26, 30)">
      {/* Hair */}
      <Path d="M12 18C12 8 20 2 30 2s18 6 18 16v6H12v-6z" fill="#1E293B" />
      {/* Head */}
      <Circle cx="30" cy="24" r="16" fill="url(#friendSkin)" />
      {/* Eyes & Smile */}
      <Circle cx="25" cy="22" r="2" fill="#0F172A" />
      <Circle cx="35" cy="22" r="2" fill="#0F172A" />
      <Path d="M26 28 Q30 33 34 28" stroke="#0F172A" strokeWidth="2" strokeLinecap="round" fill="none" />
      {/* Body */}
      <Path d="M10 50c0-12 8-16 20-16s20 4 20 16v30H10V50z" fill="#2563EB" />
    </G>

    {/* Right Friend (Girl with Yellow/Orange shirt) */}
    <G transform="translate(76, 30)">
      {/* Hair */}
      <Path d="M12 24C8 10 18 2 30 2s22 8 18 22v12H12V24z" fill="#78350F" />
      {/* Head */}
      <Circle cx="30" cy="24" r="16" fill="url(#friendSkin)" />
      {/* Eyes & Smile */}
      <Circle cx="25" cy="22" r="2" fill="#0F172A" />
      <Circle cx="35" cy="22" r="2" fill="#0F172A" />
      <Path d="M26 28 Q30 33 34 28" stroke="#0F172A" strokeWidth="2" strokeLinecap="round" fill="none" />
      {/* Body */}
      <Path d="M10 50c0-12 8-16 20-16s20 4 20 16v30H10V50z" fill="#F59E0B" />
    </G>

    {/* Shared Gift Box in Center */}
    <G transform="translate(60, 75)">
      <Rect x="0" y="8" width="40" height="34" rx="4" fill="url(#giftFriendGrad)" stroke="#FFFFFF" strokeWidth="1.5" />
      <Rect x="16" y="8" width="8" height="34" fill="#FDE047" />
      <Rect x="0" y="20" width="40" height="8" fill="#FDE047" />
      {/* Bow */}
      <Circle cx="20" cy="8" r="5" fill="#FDE047" />
    </G>

    {/* Floating Golden Coin */}
    <G transform="translate(72, 8)">
      <Circle cx="8" cy="8" r="8" fill="#F59E0B" stroke="#FDE047" strokeWidth="1.5" />
      <Path d="M6 5h4v6H6z" fill="#78350F" />
    </G>
  </Svg>
);

// ==========================================
// 6. CHARACTER & LEADERBOARD AVATAR VECTORS
// ==========================================

export const CharacterAvatarVector = ({ type = 'aman', size = 44 }) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 44 44" fill="none">
      <Defs>
        <LinearGradient id="avatarBg" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0%" stopColor="#1E3A8A" />
          <Stop offset="100%" stopColor="#0F172A" />
        </LinearGradient>
      </Defs>
      <Circle cx="22" cy="22" r="20" fill="url(#avatarBg)" stroke="#38BDF8" strokeWidth="2" />
      {/* Head */}
      <Circle cx="22" cy="16" r="9" fill="#FED7AA" />
      {/* Hair */}
      <Path d="M14 14c0-7 5-10 10-10s9 3 9 7v3H14v-4z" fill="#1E293B" />
      {/* Smile */}
      <Path d="M19 19 Q22 22 25 19" stroke="#78350F" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      {/* Body / Suit */}
      <Path d="M8 38c0-8 6-12 14-12s14 4 14 12v2H8v-2z" fill="#2563EB" />
      {/* Tie */}
      <Path d="M21 26l1 8 1-8z" fill="#EF4444" />
    </Svg>
  );
};

export const MedalVector = ({ rank = 1, size = 32 }) => {
  const medalColor = rank === 1 ? '#F59E0B' : rank === 2 ? '#94A3B8' : '#B45309';
  const ribbonColor = rank === 1 ? '#EF4444' : rank === 2 ? '#3B82F6' : '#10B981';

  return (
    <Svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      {/* Ribbons */}
      <Path d="M11 2L7 16l5-2z" fill={ribbonColor} />
      <Path d="M21 2l4 14-5-2z" fill={ribbonColor} />
      {/* Medal Disc */}
      <Circle cx="16" cy="18" r="11" fill={medalColor} stroke="#FEF08A" strokeWidth="1.5" />
      <Circle cx="16" cy="18" r="8" fill={medalColor} />
      <Path
        d={
          rank === 1
            ? 'M15 13h2v10h-2z'
            : rank === 2
              ? 'M13 14h6v2h-4v2h4v5h-6z'
              : 'M13 14h6v2h-4v2h4v5h-6z'
        }
        fill="#FFFFFF"
      />
    </Svg>
  );
};

// ==========================================
// 7. BOTTOM NAV ICONS
// ==========================================

export const BottomNavHomeIcon = ({ size = 22, color = '#FFFFFF' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M3 10l9-7 9 7v10a1 1 0 01-1 1h-5v-6h-6v6H4a1 1 0 01-1-1V10z"
      fill={color}
    />
  </Svg>
);

export const BottomNavTrophyIcon = ({ size = 22, color = '#FFFFFF' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M6 3h12v4a6 6 0 01-6 6 6 6 0 01-6-6V3zm-3 2h3v3a3 3 0 01-3-3zm18 0h-3v3a3 3 0 003-3zM11 15h2v4h-2v-4zm-4 4h10v2H7v-2z"
      fill={color}
    />
  </Svg>
);

export const BottomNavFriendsIcon = ({ size = 22, color = '#FFFFFF' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="9" cy="8" r="4" fill={color} />
    <Circle cx="17" cy="9" r="3" fill={color} opacity={0.7} />
    <Path
      d="M3 19c0-3.3 2.7-6 6-6s6 2.7 6 6H3zm11.5 0c0-2.2 1.8-4 4-4s4 1.8 4 4h-8z"
      fill={color}
    />
  </Svg>
);

export const BottomNavProfileIcon = ({ size = 22, color = '#FFFFFF' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="7" r="4" fill={color} />
    <Path d="M4 20c0-4.4 3.6-8 8-8s8 3.6 8 8H4z" fill={color} />
  </Svg>
);

// ==========================================
// 8. SOCIAL, ACTIONS & SETTINGS ICONS
// ==========================================

export const WhatsAppIcon = ({ size = 32 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="12" fill="#25D366" />
    <Path
      d="M17.5 14.5c-.3-.1-1.7-.8-2-1-.3-.1-.5-.1-.7.1s-.8 1-1 1.2c-.2.2-.4.2-.7.1-.3-.1-1.3-.5-2.5-1.5-.9-.8-1.5-1.8-1.7-2.1-.2-.3 0-.5.1-.7.1-.1.3-.3.4-.5.1-.2.2-.3.3-.5.1-.2 0-.4 0-.5-.1-.1-.7-1.7-1-2.3-.3-.6-.5-.5-.7-.5h-.6c-.2 0-.6.1-.9.4-.3.3-1.2 1.2-1.2 2.9s1.2 3.4 1.4 3.6c.2.2 2.4 3.7 5.8 5.1.8.3 1.4.5 1.9.7.8.2 1.5.2 2.1.1.7-.1 2.1-.9 2.4-1.7.3-.8.3-1.5.2-1.7-.1-.2-.3-.3-.6-.4z"
      fill="#FFFFFF"
    />
  </Svg>
);

export const TelegramIcon = ({ size = 32 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="12" fill="#229ED9" />
    <Path
      d="M5.5 11.5l11-4.5c.5-.2 1 .2.9.7l-2 9.5c-.1.5-.6.8-1.1.5l-3.3-2.4-1.6 1.5c-.2.2-.5.1-.6-.2l-.6-3.8 6.5-5.8-8 5.1-1.2-.4z"
      fill="#FFFFFF"
    />
  </Svg>
);

export const InstagramIcon = ({ size = 32 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Defs>
      <LinearGradient id="instaGrad" x1="0" y1="1" x2="1" y2="0">
        <Stop offset="0%" stopColor="#F58529" />
        <Stop offset="30%" stopColor="#DD2A7B" />
        <Stop offset="70%" stopColor="#8134AF" />
        <Stop offset="100%" stopColor="#515BD4" />
      </LinearGradient>
    </Defs>
    <Circle cx="12" cy="12" r="12" fill="url(#instaGrad)" />
    <Rect x="6.5" y="6.5" width="11" height="11" rx="3" stroke="#FFFFFF" strokeWidth="1.5" fill="none" />
    <Circle cx="12" cy="12" r="2.8" stroke="#FFFFFF" strokeWidth="1.5" fill="none" />
    <Circle cx="15.2" cy="8.8" r="0.8" fill="#FFFFFF" />
  </Svg>
);

export const BackArrowIcon = ({ size = 24, color = '#FFFFFF' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M15 19l-7-7 7-7"
      stroke={color}
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const SettingsGearIcon = ({ size = 22, color = '#FFFFFF' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 15a3 3 0 100-6 3 3 0 000 6z"
      fill={color}
    />
    <Path
      d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"
      fill={color}
    />
  </Svg>
);

export const DiceIcon = ({ size = 28, color = '#FFFFFF' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect x="2" y="2" width="20" height="20" rx="5" fill={color} stroke="#CBD5E1" strokeWidth="1.5" />
    <Circle cx="6.5" cy="6.5" r="1.8" fill="#1E293B" />
    <Circle cx="17.5" cy="6.5" r="1.8" fill="#1E293B" />
    <Circle cx="12" cy="12" r="2.4" fill="#EF4444" />
    <Circle cx="6.5" cy="17.5" r="1.8" fill="#1E293B" />
    <Circle cx="17.5" cy="17.5" r="1.8" fill="#1E293B" />
  </Svg>
);

export const FriendsIcon = ({ size = 28, color = '#38BDF8' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="9" cy="8" r="4" fill={color} />
    <Circle cx="17" cy="9" r="3" fill={color} opacity={0.7} />
    <Path
      d="M3 19c0-3.3 2.7-6 6-6s6 2.7 6 6H3zm11.5 0c0-2.2 1.8-4 4-4s4 1.8 4 4h-8z"
      fill={color}
    />
  </Svg>
);

export const TrophyIcon = ({ size = 26, color = '#F59E0B' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Defs>
      <LinearGradient id="trophyGrad" x1="0" y1="0" x2="1" y2="1">
        <Stop offset="0%" stopColor="#FDE047" />
        <Stop offset="100%" stopColor="#D97706" />
      </LinearGradient>
    </Defs>
    <Path
      d="M6 3h12v4a6 6 0 01-6 6 6 6 0 01-6-6V3zm-3 2h3v3a3 3 0 01-3-3zm18 0h-3v3a3 3 0 003-3zM11 15h2v4h-2v-4zm-4 4h10v2H7v-2z"
      fill="url(#trophyGrad)"
    />
  </Svg>
);

export const StoreIcon = ({ size = 26, color = '#38BDF8' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M4 4h16l-2 5H6L4 4zm-1 7h18v10a1 1 0 01-1 1H4a1 1 0 01-1-1V11zm6 3v5h6v-5H9z"
      fill={color}
    />
  </Svg>
);

export const GiftIcon = ({ size = 26, color = '#F43F5E' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Defs>
      <LinearGradient id="giftGrad" x1="0" y1="0" x2="1" y2="1">
        <Stop offset="0%" stopColor="#FB7185" />
        <Stop offset="100%" stopColor="#E11D48" />
      </LinearGradient>
    </Defs>
    <Rect x="4" y="9" width="16" height="12" rx="2" fill="url(#giftGrad)" />
    <Rect x="3" y="5" width="18" height="4" rx="1.5" fill="#F43F5E" />
    <Rect x="10.5" y="5" width="3" height="16" fill="#FDE047" />
    <Path
      d="M12 5C10 2 8 3 8 4.5S10.5 5 12 5zm0 0c2-3 4-2 4-.5S13.5 5 12 5z"
      fill="#FDE047"
    />
  </Svg>
);

export const NotificationBellIcon = ({ size = 22, color = '#FFFFFF' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 22a2 2 0 002-2h-4a2 2 0 002 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4a1.5 1.5 0 00-3 0v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"
      fill={color}
    />
  </Svg>
);
