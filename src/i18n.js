// Mehrsprachigkeit (DE / TR / AR) mit einfachem t()-System.
import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LANG_KEY = 'darna:lang:v1';

export const LANGUAGES = [
  { code: 'de', label: 'Deutsch', flag: '🇩🇪' },
  { code: 'tr', label: 'Türkçe', flag: '🇹🇷' },
  { code: 'ar', label: 'العربية', flag: '🇸🇦' },
];

export const RTL_LANGS = ['ar'];

// Übersetzungen. Fehlt ein Schlüssel, wird Deutsch (Fallback) genutzt.
const T = {
  de: {
    'nav.home': 'Home', 'nav.rent': 'Miete', 'nav.verwaltung': 'Verwaltung', 'nav.owners': 'Eigentümer',
    'nav.posta': 'Post', 'nav.market': 'Markt', 'nav.crafts': 'Handwerker', 'nav.jobs': 'Aufträge',
    'nav.fund': 'Fonds', 'nav.start': 'Startseite', 'nav.bildirim': 'Mitteilungen', 'nav.odeme': 'Zahlung', 'nav.menu': 'Menü',

    'common.logout': 'Abmelden', 'common.settings': 'Einstellungen', 'common.cancel': 'Abbrechen',
    'common.close': 'Schließen', 'common.save': 'Speichern', 'common.send': 'Senden', 'common.back': 'Zurück',

    'role.admin': 'Administrator', 'role.owner': 'Eigentümer', 'role.tenant': 'Mieter',
    'role.company': 'Firma', 'role.worker': 'Handwerker',

    'login.subtitle': 'Immobilien-Verwaltung', 'login.email': 'E-Mail', 'login.password': 'Passwort',
    'login.signIn': 'Anmelden', 'login.demo': 'Demo-Konten (tippen zum Ausfüllen)',
    'login.errEmpty': 'Bitte E-Mail und Passwort eingeben.', 'login.errWrong': 'E-Mail oder Passwort ist falsch.',

    'onb.skip': 'Überspringen', 'onb.next': 'Weiter', 'onb.start': "Los geht's",
    'onb.t1': 'Willkommen bei Darna', 'onb.x1': 'Ihre Immobilien, Mieten und die Hausverwaltung – alles an einem Ort.',
    'onb.t2': 'Alles im Blick', 'onb.x2': 'Forderungen einsehen, bequem bezahlen und jede Zahlung nachverfolgen.',
    'onb.t3': 'Schnelle Hilfe', 'onb.x3': 'Mängel melden, Handwerker-Angebote erhalten und Nachrichten der Verwaltung empfangen.',

    'set.title': 'Einstellungen', 'set.notifications': 'Benachrichtigungen',
    'set.notifDesc': 'Hinweise zu Zahlungen, Mängeln und Nachrichten.', 'set.test': 'Test-Benachrichtigung senden',
    'set.sent': '✓ Gesendet', 'set.unavail': 'Nicht verfügbar auf diesem Gerät', 'set.language': 'Sprache',
    'set.theme': 'Design', 'set.dark': 'Dunkel', 'set.light': 'Hell',

    'home.greetMorning': 'Guten Morgen', 'home.greetDay': 'Guten Tag', 'home.greetEvening': 'Guten Abend',
    'home.currentDues': 'Aktuelle Forderungen', 'home.noDues': '✓ Keine offenen Forderungen.',
    'home.totalDue': 'Gesamt fällig', 'home.until': 'bis', 'home.rep': 'Kundenbetreuer',
    'home.bank': 'Bankverbindung', 'home.lastPay': 'Letzte Zahlungen', 'home.management': 'Hausverwaltung',
    'home.ann': 'Ankündigungen & Angebote', 'home.name': 'Name', 'home.phone': 'Telefon',
    'home.rest': 'Rest', 'home.receipt': 'Beleg',
  },
  tr: {
    'nav.home': 'Ana Sayfa', 'nav.rent': 'Kira', 'nav.verwaltung': 'Yönetim', 'nav.owners': 'Mülk Sahipleri',
    'nav.posta': 'Posta', 'nav.market': 'Pazar', 'nav.crafts': 'Ustalar', 'nav.jobs': 'İşler',
    'nav.fund': 'Fonlar', 'nav.start': 'Ana Sayfa', 'nav.bildirim': 'Bildirimler', 'nav.odeme': 'Ödeme', 'nav.menu': 'Menü',

    'common.logout': 'Çıkış', 'common.settings': 'Ayarlar', 'common.cancel': 'İptal',
    'common.close': 'Kapat', 'common.save': 'Kaydet', 'common.send': 'Gönder', 'common.back': 'Geri',

    'role.admin': 'Yönetici', 'role.owner': 'Mülk Sahibi', 'role.tenant': 'Kiracı',
    'role.company': 'Firma', 'role.worker': 'Usta',

    'login.subtitle': 'Emlak Yönetimi', 'login.email': 'E-posta', 'login.password': 'Şifre',
    'login.signIn': 'Giriş Yap', 'login.demo': 'Demo hesaplar (doldurmak için dokun)',
    'login.errEmpty': 'Lütfen e-posta ve şifre girin.', 'login.errWrong': 'E-posta veya şifre yanlış.',

    'onb.skip': 'Atla', 'onb.next': 'Devam', 'onb.start': 'Başla',
    'onb.t1': "Darna'ya Hoş Geldiniz", 'onb.x1': 'Mülkleriniz, kiralarınız ve site yönetimi – hepsi tek yerde.',
    'onb.t2': 'Her Şey Kontrol Altında', 'onb.x2': 'Borçları görün, kolayca ödeyin ve her ödemeyi takip edin.',
    'onb.t3': 'Hızlı Yardım', 'onb.x3': 'Arıza bildirin, usta teklifleri alın ve yönetimden mesajlar alın.',

    'set.title': 'Ayarlar', 'set.notifications': 'Bildirimler',
    'set.notifDesc': 'Ödeme, arıza ve mesaj bildirimleri.', 'set.test': 'Test bildirimi gönder',
    'set.sent': '✓ Gönderildi', 'set.unavail': 'Bu cihazda kullanılamıyor', 'set.language': 'Dil',
    'set.theme': 'Tema', 'set.dark': 'Koyu', 'set.light': 'Açık',

    'home.greetMorning': 'Günaydın', 'home.greetDay': 'İyi Günler', 'home.greetEvening': 'İyi Akşamlar',
    'home.currentDues': 'Güncel Borçlar', 'home.noDues': '✓ Açık borcunuz yok.',
    'home.totalDue': 'Toplam Borç', 'home.until': 'son tarih', 'home.rep': 'Müşteri Temsilcisi',
    'home.bank': 'Banka Bilgileri', 'home.lastPay': 'Son Ödemeler', 'home.management': 'Bina Yönetimi',
    'home.ann': 'Duyurular & Kampanyalar', 'home.name': 'Ad', 'home.phone': 'Telefon',
    'home.rest': 'Kalan', 'home.receipt': 'Makbuz',
  },
  ar: {
    'nav.home': 'الرئيسية', 'nav.rent': 'الإيجار', 'nav.verwaltung': 'الإدارة', 'nav.owners': 'الملاك',
    'nav.posta': 'الرسائل', 'nav.market': 'السوق', 'nav.crafts': 'الحرفيون', 'nav.jobs': 'الأعمال',
    'nav.fund': 'الصناديق', 'nav.start': 'الرئيسية', 'nav.bildirim': 'الإشعارات', 'nav.odeme': 'الدفع', 'nav.menu': 'القائمة',

    'common.logout': 'تسجيل الخروج', 'common.settings': 'الإعدادات', 'common.cancel': 'إلغاء',
    'common.close': 'إغلاق', 'common.save': 'حفظ', 'common.send': 'إرسال', 'common.back': 'رجوع',

    'role.admin': 'مدير', 'role.owner': 'مالك', 'role.tenant': 'مستأجر',
    'role.company': 'شركة', 'role.worker': 'حرفي',

    'login.subtitle': 'إدارة العقارات', 'login.email': 'البريد الإلكتروني', 'login.password': 'كلمة المرور',
    'login.signIn': 'تسجيل الدخول', 'login.demo': 'حسابات تجريبية (اضغط للتعبئة)',
    'login.errEmpty': 'يرجى إدخال البريد وكلمة المرور.', 'login.errWrong': 'البريد أو كلمة المرور غير صحيحة.',

    'onb.skip': 'تخطي', 'onb.next': 'التالي', 'onb.start': 'لنبدأ',
    'onb.t1': 'مرحباً بك في دارنا', 'onb.x1': 'عقاراتك وإيجاراتك وإدارة المبنى – كل ذلك في مكان واحد.',
    'onb.t2': 'كل شيء أمامك', 'onb.x2': 'اطّلع على المستحقات، وادفع بسهولة، وتابع كل عملية دفع.',
    'onb.t3': 'مساعدة سريعة', 'onb.x3': 'أبلغ عن الأعطال، واحصل على عروض الحرفيين، واستقبل رسائل الإدارة.',

    'set.title': 'الإعدادات', 'set.notifications': 'الإشعارات',
    'set.notifDesc': 'تنبيهات حول المدفوعات والأعطال والرسائل.', 'set.test': 'إرسال إشعار تجريبي',
    'set.sent': '✓ تم الإرسال', 'set.unavail': 'غير متوفر على هذا الجهاز', 'set.language': 'اللغة',
    'set.theme': 'المظهر', 'set.dark': 'داكن', 'set.light': 'فاتح',

    'home.greetMorning': 'صباح الخير', 'home.greetDay': 'يومًا سعيدًا', 'home.greetEvening': 'مساء الخير',
    'home.currentDues': 'المستحقات الحالية', 'home.noDues': '✓ لا توجد مستحقات.',
    'home.totalDue': 'إجمالي المستحق', 'home.until': 'حتى', 'home.rep': 'ممثل الخدمة',
    'home.bank': 'المعلومات البنكية', 'home.lastPay': 'آخر المدفوعات', 'home.management': 'إدارة المبنى',
    'home.ann': 'الإعلانات والعروض', 'home.name': 'الاسم', 'home.phone': 'الهاتف',
    'home.rest': 'المتبقي', 'home.receipt': 'إيصال',
  },
};

const LangContext = createContext(null);

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState('de');

  useEffect(() => {
    AsyncStorage.getItem(LANG_KEY).then((v) => { if (v) setLangState(v); }).catch(() => {});
  }, []);

  const setLang = (code) => {
    setLangState(code);
    AsyncStorage.setItem(LANG_KEY, code).catch(() => {});
  };

  // t(key, vars) – ersetzt {var}
  const t = (key, vars) => {
    let s = (T[lang] && T[lang][key]) || T.de[key] || key;
    if (vars) Object.keys(vars).forEach((k) => { s = s.replace(`{${k}}`, vars[k]); });
    return s;
  };

  const rtl = RTL_LANGS.includes(lang);

  return <LangContext.Provider value={{ lang, setLang, t, rtl }}>{children}</LangContext.Provider>;
}

export function useLang() {
  const ctx = useContext(LangContext);
  // Fallback, falls außerhalb des Providers verwendet
  if (!ctx) return { lang: 'de', setLang: () => {}, t: (k) => (T.de[k] || k), rtl: false };
  return ctx;
}
