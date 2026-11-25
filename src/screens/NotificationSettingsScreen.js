// import React from 'react';
// import {
//   StyleSheet,
//   View,
//   Text,
//   StatusBar,
//   ScrollView,
//   Switch,
// } from 'react-native';
// import { SafeAreaView } from 'react-native-safe-area-context';
// import ScreenHeader from '../components/ui/ScreenHeader';
// import { useTheme } from '../context/ThemeContext';

// export default function NotificationSettingsScreen({ onBack }) {
//   const { appTheme, settings, updateSettings } = useTheme();

//   const handleToggle = (key, val) => {
//     updateSettings({ [key]: val });
//   };

//   const isMasterOn = settings.notifications ?? true;

//   return (
//     <SafeAreaView style={[styles.container, { backgroundColor: appTheme.colors.background }]}>
//       <StatusBar barStyle="light-content" backgroundColor={appTheme.colors.surface} />
//       <ScreenHeader title="Notifications" onBack={onBack} />

//       <ScrollView
//         style={styles.scroll}
//         contentContainerStyle={styles.scrollContent}
//         showsVerticalScrollIndicator={false}
//       >
//         {/* Master Switch Banner */}
//         <View
//           style={[
//             styles.masterCard,
//             { backgroundColor: appTheme.colors.surface, borderColor: appTheme.colors.border },
//           ]}
//         >
//           <View style={styles.masterLeft}>
//             <Text style={styles.masterIcon}>🔔</Text>
//             <View style={styles.masterTextCol}>
//               <Text style={[styles.masterTitle, { color: appTheme.colors.text }]}>Push Notifications</Text>
//               <Text style={[styles.masterSub, { color: appTheme.colors.secondaryText }]}>
//                 {isMasterOn ? 'Receiving real-time game alerts' : 'All push alerts are disabled'}
//               </Text>
//             </View>
//           </View>

//           <Switch
//             value={isMasterOn}
//             onValueChange={(val) => handleToggle('notifications', val)}
//             trackColor={{ false: '#334155', true: appTheme.colors.primary }}
//             thumbColor="#FFFFFF"
//           />
//         </View>

//         {/* Section: Category Toggles */}
//         <View style={styles.section}>
//           <Text style={[styles.sectionTitle, { color: appTheme.colors.secondaryText }]}>
//             ALERT CATEGORIES
//           </Text>
//           <View
//             style={[
//               styles.card,
//               { backgroundColor: appTheme.colors.surface, borderColor: 'rgba(255,255,255,0.06)' },
//               !isMasterOn && styles.disabledCard,
//             ]}
//           >
//             {/* Daily Bonus */}
//             <View style={styles.row}>
//               <View style={styles.rowLeft}>
//                 <Text style={styles.rowIcon}>🎁</Text>
//                 <View style={styles.rowTextCol}>
//                   <Text style={[styles.rowTitle, { color: appTheme.colors.text }]}>Daily Bonus Reminders</Text>
//                   <Text style={[styles.rowSub, { color: appTheme.colors.secondaryText }]}>
//                     Free daily coins & lucky spin alerts
//                   </Text>
//                 </View>
//               </View>
//               <Switch
//                 disabled={!isMasterOn}
//                 value={(settings.dailyBonusAlert ?? true) && isMasterOn}
//                 onValueChange={(val) => handleToggle('dailyBonusAlert', val)}
//                 trackColor={{ false: '#334155', true: appTheme.colors.primary }}
//                 thumbColor="#FFFFFF"
//               />
//             </View>

//             <View style={styles.divider} />

//             {/* Turn Alerts */}
//             <View style={styles.row}>
//               <View style={styles.rowLeft}>
//                 <Text style={styles.rowIcon}>🎲</Text>
//                 <View style={styles.rowTextCol}>
//                   <Text style={[styles.rowTitle, { color: appTheme.colors.text }]}>Your Turn Reminders</Text>
//                   <Text style={[styles.rowSub, { color: appTheme.colors.secondaryText }]}>
//                     Notify when opponents finish moves
//                   </Text>
//                 </View>
//               </View>
//               <Switch
//                 disabled={!isMasterOn}
//                 value={(settings.turnAlert ?? true) && isMasterOn}
//                 onValueChange={(val) => handleToggle('turnAlert', val)}
//                 trackColor={{ false: '#334155', true: appTheme.colors.primary }}
//                 thumbColor="#FFFFFF"
//               />
//             </View>

//             <View style={styles.divider} />

//             {/* Friend Challenge */}
//             <View style={styles.row}>
//               <View style={styles.rowLeft}>
//                 <Text style={styles.rowIcon}>⚔️</Text>
//                 <View style={styles.rowTextCol}>
//                   <Text style={[styles.rowTitle, { color: appTheme.colors.text }]}>Friend Challenges</Text>
//                   <Text style={[styles.rowSub, { color: appTheme.colors.secondaryText }]}>
//                     Alerts when friends invite you to play
//                   </Text>
//                 </View>
//               </View>
//               <Switch
//                 disabled={!isMasterOn}
//                 value={(settings.friendAlert ?? true) && isMasterOn}
//                 onValueChange={(val) => handleToggle('friendAlert', val)}
//                 trackColor={{ false: '#334155', true: appTheme.colors.primary }}
//                 thumbColor="#FFFFFF"
//               />
//             </View>

//             <View style={styles.divider} />

//             {/* Tournaments */}
//             <View style={styles.row}>
//               <View style={styles.rowLeft}>
//                 <Text style={styles.rowIcon}>🏆</Text>
//                 <View style={styles.rowTextCol}>
//                   <Text style={[styles.rowTitle, { color: appTheme.colors.text }]}>Tournaments & Events</Text>
//                   <Text style={[styles.rowSub, { color: appTheme.colors.secondaryText }]}>
//                     Special limited-time cup announcements
//                   </Text>
//                 </View>
//               </View>
//               <Switch
//                 disabled={!isMasterOn}
//                 value={(settings.tournamentAlert ?? true) && isMasterOn}
//                 onValueChange={(val) => handleToggle('tournamentAlert', val)}
//                 trackColor={{ false: '#334155', true: appTheme.colors.primary }}
//                 thumbColor="#FFFFFF"
//               />
//             </View>
//           </View>
//         </View>

//         {/* Section: Quiet Hours */}
//         <View style={styles.section}>
//           <Text style={[styles.sectionTitle, { color: appTheme.colors.secondaryText }]}>
//             QUIET HOURS
//           </Text>
//           <View
//             style={[
//               styles.card,
//               { backgroundColor: appTheme.colors.surface, borderColor: 'rgba(255,255,255,0.06)' },
//             ]}
//           >
//             <View style={styles.row}>
//               <View style={styles.rowLeft}>
//                 <Text style={styles.rowIcon}>🌙</Text>
//                 <View style={styles.rowTextCol}>
//                   <Text style={[styles.rowTitle, { color: appTheme.colors.text }]}>Night Quiet Hours (10 PM - 8 AM)</Text>
//                   <Text style={[styles.rowSub, { color: appTheme.colors.secondaryText }]}>
//                     Mute non-essential notifications overnight
//                   </Text>
//                 </View>
//               </View>
//               <Switch
//                 value={settings.quietHours ?? false}
//                 onValueChange={(val) => handleToggle('quietHours', val)}
//                 trackColor={{ false: '#334155', true: appTheme.colors.primary }}
//                 thumbColor="#FFFFFF"
//               />
//             </View>
//           </View>
//         </View>
//       </ScrollView>
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//   },
//   scroll: {
//     flex: 1,
//   },
//   scrollContent: {
//     padding: 16,
//     paddingBottom: 32,
//   },
//   masterCard: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     borderRadius: 16,
//     padding: 16,
//     borderWidth: 1,
//     marginBottom: 20,
//   },
//   masterLeft: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 12,
//     flex: 1,
//   },
//   masterIcon: {
//     fontSize: 26,
//   },
//   masterTextCol: {
//     flex: 1,
//   },
//   masterTitle: {
//     fontSize: 16,
//     fontWeight: '800',
//   },
//   masterSub: {
//     fontSize: 12,
//     marginTop: 2,
//   },
//   section: {
//     marginBottom: 20,
//   },
//   sectionTitle: {
//     fontSize: 11,
//     fontWeight: '800',
//     letterSpacing: 1,
//     marginBottom: 8,
//     marginLeft: 4,
//   },
//   card: {
//     borderRadius: 16,
//     borderWidth: 1,
//     paddingHorizontal: 16,
//     paddingVertical: 4,
//   },
//   disabledCard: {
//     opacity: 0.5,
//   },
//   row: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     paddingVertical: 14,
//   },
//   rowLeft: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 12,
//     flex: 1,
//     paddingRight: 10,
//   },
//   rowIcon: {
//     fontSize: 20,
//   },
//   rowTextCol: {
//     flex: 1,
//   },
//   rowTitle: {
//     fontSize: 15,
//     fontWeight: '700',
//   },
//   rowSub: {
//     fontSize: 12,
//     marginTop: 2,
//   },
//   divider: {
//     height: 1,
//     backgroundColor: 'rgba(255, 255, 255, 0.05)',
//   },
// });
