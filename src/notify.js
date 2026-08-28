// Lokale Benachrichtigungen (best effort – funktioniert je nach Gerät/Expo Go)
import * as Notifications from 'expo-notifications';

// Wie ankommende Benachrichtigungen im Vordergrund angezeigt werden
try {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
    }),
  });
} catch (e) { /* ignorieren */ }

// Berechtigung sicherstellen
export async function ensureNotifyPermission() {
  try {
    const { status } = await Notifications.getPermissionsAsync();
    if (status === 'granted') return true;
    const res = await Notifications.requestPermissionsAsync();
    return res.status === 'granted';
  } catch (e) {
    return false;
  }
}

// Sofortige lokale Benachrichtigung senden
export async function notify(title, body) {
  try {
    if (!(await ensureNotifyPermission())) return false;
    await Notifications.scheduleNotificationAsync({
      content: { title, body },
      trigger: null,
    });
    return true;
  } catch (e) {
    return false;
  }
}
