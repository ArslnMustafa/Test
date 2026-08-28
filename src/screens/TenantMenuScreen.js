// Mieter-Modul – Menü/Hub mit Wohnungs- und Gebäudeberichten.
// Struktur wie in der Referenz-App; Inhalte werden nach und nach gefüllt.
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Card, Badge, Button, MessageCard } from '../components/UI';
import { ConfirmModal, FormModal } from '../components/Modals';
import { useStore } from '../store/store';
import { notify } from '../notify';
import { eur, eur2, dmy, when, jobIcon } from '../utils';
import { colors, spacing, radius, font } from '../theme';

// freie Texteingabe -> Kategorie
function toCategory(txt) {
  const t = String(txt || '').toLowerCase();
  if (/sanit|wasser|rohr|abfluss/.test(t)) return 'plumbing';
  if (/elektr|strom|sicherung/.test(t)) return 'electrical';
  if (/mal|streich|farbe/.test(t)) return 'painting';
  if (/heiz|gas|therme/.test(t)) return 'heating';
  return 'other';
}

const JOB_STATUS = {
  open: { label: 'Offen', tone: 'gold' },
  assigned: { label: 'Vergeben', tone: 'green' },
  done: { label: 'Erledigt', tone: 'green' },
  cancelled: { label: 'Storniert', tone: 'red' },
};

// Menügruppen (deutsches Label + türkischer Referenzname als Untertitel)
const GROUPS = [
  {
    title: 'Wohnungsberichte',
    hint: 'Mesken Raporları',
    icon: '🪪',
    items: [
      { key: 'maengel',     icon: '🛠️', label: 'Schaden melden',     hint: 'Arıza / Mängel' },
      { key: 'messages',    icon: '💬', label: 'Nachrichten',        hint: 'Mesajlar' },
      { key: 'debts',       icon: '🧾', label: 'Meine Schulden',     hint: 'Borçlarım' },
      { key: 'payments',    icon: '💳', label: 'Meine Zahlungen',    hint: 'Ödemelerim' },
      { key: 'inkasso',     icon: '🔒', label: 'Inkasso-Akten',      hint: 'İcra Dosyaları' },
      { key: 'transfers',   icon: '↗️', label: 'Banküberweisungen',  hint: 'Banka Havalelerim' },
      { key: 'online',      icon: '🖱️', label: 'Online-Zahlungen',   hint: 'Online Ödemelerim' },
    ],
  },
  {
    title: 'Gebäudeberichte',
    hint: 'Apartman Raporları',
    icon: '🏢',
    items: [
      { key: 'infocard',    icon: 'ℹ️',  label: 'Infokarte',           hint: 'Bilgi Kartı' },
      { key: 'news',        icon: '📢', label: 'Ankündigungen',       hint: 'Duyurular' },
      { key: 'status',      icon: '🗓️', label: 'Aktueller Stand',     hint: 'Güncel Durum' },
      { key: 'incexp',      icon: '↕️', label: 'Einnahmen / Ausgaben', hint: 'Gelir / Gider' },
      { key: 'receivables', icon: '📄', label: 'Forderungsliste',     hint: 'Alacak Listesi' },
      { key: 'debtlist',    icon: '📑', label: 'Schuldenliste',       hint: 'Borç Listesi' },
    ],
  },
];

// Zeitabhängige Begrüßung
function greeting() {
  const h = new Date().getHours();
  if (h < 11) return 'Guten Morgen';
  if (h < 18) return 'Guten Tag';
  return 'Guten Abend';
}

export default function TenantMenuScreen() {
  const { state, actions, currentUser } = useStore();
  const [view, setView] = useState('menu'); // 'menu' oder Item-Key
  const [payOpen, setPayOpen] = useState(false);
  const [maengelOpen, setMaengelOpen] = useState(false);
  const [photo, setPhoto] = useState(null); // Foto-URI für die Mängelmeldung

  // Foto aus der Galerie wählen
  const pickPhoto = async () => {
    try {
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) return;
      const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.6 });
      if (!res.canceled && res.assets?.[0]?.uri) setPhoto(res.assets[0].uri);
    } catch (e) { /* ignorieren */ }
  };

  // eigene Mängelmeldungen
  const myJobs = (state.jobs || []).filter((j) => j.tenantId === currentUser?.tenantId).sort((a, b) => b.at - a.at);

  const tenant = state.tenants.find((t) => t.id === currentUser?.tenantId) || null;
  const allItems = GROUPS.flatMap((g) => g.items);
  const activeItem = allItems.find((i) => i.key === view);

  // Eigene Nachrichten (Posteingang)
  const myMessages = (state.messages || [])
    .filter((m) => m.toUserId === currentUser?.id)
    .sort((a, b) => b.at - a.at);
  const nameFor = (id) => (state.users.find((u) => u.id === id)?.name) || 'Verwaltung';

  // Eigene Schulden & Zahlungen (nach Datum)
  const tid = currentUser?.tenantId;
  const myDebts = (state.debtItems || []).filter((d) => d.tenantId === tid).sort((a, b) => a.dueDate - b.dueDate);
  const myPayments = (state.payments || []).filter((p) => p.tenantId === tid).sort((a, b) => b.at - a.at);

  // ---- Untermenü-Ansicht ----
  if (activeItem) {
    return (
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <TouchableOpacity style={styles.back} activeOpacity={0.7} onPress={() => setView('menu')}>
          <Text style={styles.backText}>‹ Zurück</Text>
        </TouchableOpacity>
        <Text style={styles.detailTitle}>{activeItem.icon}  {activeItem.label}</Text>

        {renderDetail(view, { state, tid, tenant, setPayOpen, myMessages, nameFor, myDebts, myPayments, myJobs, setMaengelOpen, photo, pickPhoto })}

        <View style={{ height: spacing.xl }} />

        {tenant && (
          <ConfirmModal
            visible={payOpen}
            title="Zahlung bestätigen?"
            message={`Offenen Betrag von ${eur(tenant.overdueEur)} jetzt als bezahlt markieren?`}
            confirmLabel="Ja, bezahlen"
            onConfirm={() => actions.markPaid(tenant.id)}
            onClose={() => setPayOpen(false)}
          />
        )}

        {/* Neuen Mangel melden */}
        <FormModal
          visible={maengelOpen}
          title="Schaden / Mangel melden"
          submitLabel="An Verwaltung senden"
          fields={[
            { key: 'title', label: 'Kurzbeschreibung', placeholder: 'z. B. Wasserrohrbruch im Bad' },
            { key: 'area', label: 'Bereich', placeholder: 'z. B. Sanitär, Elektrik, Heizung' },
            { key: 'description', label: 'Details', placeholder: 'Was ist genau das Problem?' },
          ]}
          onSubmit={(v) => { actions.reportDefect({ title: v.title, description: v.description, category: toCategory(v.area || v.title), photo }); setPhoto(null); notify('Schaden gemeldet', 'Ihre Meldung wurde an die Verwaltung übermittelt.'); }}
          onClose={() => setMaengelOpen(false)}
        />
      </ScrollView>
    );
  }

  // ---- Hauptmenü ----
  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      {/* Kopf */}
      <View style={styles.hero}>
        <Text style={styles.heroName}>Menü</Text>
        <Text style={styles.heroAddr}>{currentUser?.name}{tenant ? ` · ${tenant.propertyName}` : ''}</Text>
      </View>

      {GROUPS.map((g) => (
        <View key={g.title}>
          <Text style={styles.groupTitle}>{g.icon}  {g.title.toUpperCase()}</Text>
          {g.items.map((it) => {
            const badge = itemBadge(it.key, tenant, { msgCount: myMessages.length, debtCount: myDebts.length, payCount: myPayments.length, maengelCount: myJobs.filter((j) => j.status !== 'done').length });
            return (
              <TouchableOpacity key={it.key} activeOpacity={0.8} onPress={() => setView(it.key)}>
                <View style={styles.row}>
                  <View style={styles.rowIcon}><Text style={{ fontSize: 18 }}>{it.icon}</Text></View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.rowLabel}>{it.label}</Text>
                    <Text style={styles.rowHint}>{it.hint}</Text>
                  </View>
                  {badge}
                  <Text style={styles.chevron}>›</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      ))}

      <View style={{ height: spacing.xl }} />
    </ScrollView>
  );
}

// Kleiner Status-Badge an bestimmten Menüpunkten
function itemBadge(key, tenant, { msgCount, debtCount, payCount, maengelCount } = {}) {
  if (key === 'maengel' && maengelCount > 0) return <Badge label={String(maengelCount)} tone="gold" />;
  if (key === 'messages' && msgCount > 0) return <Badge label={String(msgCount)} tone="blue" />;
  if (key === 'debtlist' && debtCount > 0) return <Badge label={String(debtCount)} tone="gold" />;
  if (key === 'payments' && payCount > 0) return <Badge label={String(payCount)} tone="blue" />;
  if (!tenant) return null;
  if (key === 'debts' && tenant.status === 'overdue') return <Badge label={eur(tenant.overdueEur)} tone="red" />;
  if (key === 'debts' && tenant.status === 'paid') return <Badge label="0 €" tone="green" />;
  return null;
}

const STATUS_LABEL = {
  this_month: { label: 'Diesen Monat', color: colors.blueSoft },
  overdue: { label: 'Überfällig', color: '#f87171' },
  upcoming: { label: 'Bevorstehend', color: colors.textMuted },
};

// Inhalt je Menüpunkt (mit Daten gefüllt oder Platzhalter)
function renderDetail(key, { state, tid, tenant, setPayOpen, myMessages, nameFor, myDebts, myPayments, myJobs, setMaengelOpen, photo, pickPhoto }) {
  // --- Gebäude: Ankündigungen & Werbung ---
  if (key === 'news') {
    const list = state.announcements || [];
    if (list.length === 0) return <ComingSoon note="Keine Ankündigungen." />;
    return (
      <View>
        {list.map((a) => (
          <Card key={a.id} style={a.kind === 'ad' ? { borderColor: '#4a380f', backgroundColor: '#2a1f08' } : null}>
            <View style={styles.between}>
              <Text style={styles.cardTitle}>{a.title}</Text>
              <Badge label={a.kind === 'ad' ? 'Werbung' : a.kind === 'warning' ? 'Wichtig' : 'Info'} tone={a.kind === 'ad' ? 'gold' : a.kind === 'warning' ? 'red' : 'blue'} />
            </View>
            <Text style={styles.bodyText}>{a.text}</Text>
            <Text style={styles.jSub}>{dmy(a.at)}</Text>
          </Card>
        ))}
      </View>
    );
  }

  // --- Gebäude: Infokarte (eigene Wohnung) ---
  if (key === 'infocard') {
    const u = tenant?.unit;
    if (!u) return <ComingSoon note="Keine Wohnungsdaten hinterlegt." />;
    return (
      <Card>
        <KV label="Block" value={u.block} />
        <KV label="Etage" value={String(u.floor)} />
        <KV label="Wohnung Nr." value={String(u.no)} />
        <KV label="Zimmer" value={u.rooms} />
        <KV label="Fläche" value={`${u.sqm} m²`} />
        <KV label="Bewohner" value={`${u.persons} Personen`} />
        <KV label="Mieter seit" value={u.since} />
        <KV label="Kaution" value={eur2(u.depositEur)} last />
      </Card>
    );
  }

  // --- Gebäude: Aktueller Stand ---
  if (key === 'status') {
    const openDebt = (myDebts || []).reduce((a, d) => a + d.amountEur + d.surchargeEur, 0);
    const lastPay = (myPayments || [])[0];
    const openMaengel = (myJobs || []).filter((j) => j.status !== 'done').length;
    return (
      <View>
        <View style={styles.tiles}>
          <Tile label="Offener Betrag" value={eur2(openDebt)} tone={openDebt > 0 ? 'red' : 'green'} />
          <Tile label="Offene Mängel" value={String(openMaengel)} tone="gold" />
        </View>
        <Card>
          <KV label="Letzte Zahlung" value={lastPay ? `${eur2(lastPay.amountEur)} · ${dmy(lastPay.at)}` : '—'} />
          <KV label="Zahlungen gesamt" value={String((myPayments || []).length)} />
          <KV label="Mietstatus" value={tenant?.status === 'overdue' ? 'Überfällig' : 'Aktuell'} last />
        </Card>
      </View>
    );
  }

  // --- Gebäude: Einnahmen / Ausgaben ---
  if (key === 'incexp') {
    const f = state.buildingFinance;
    if (!f) return <ComingSoon />;
    const inc = f.income.reduce((a, x) => a + x.amountEur, 0);
    const exp = f.expense.reduce((a, x) => a + x.amountEur, 0);
    return (
      <View>
        <Text style={styles.periodLabel}>{f.period}</Text>
        <Card>
          <Text style={styles.blockTitle}>Einnahmen</Text>
          {f.income.map((x, i) => <KV key={i} label={x.label} value={eur2(x.amountEur)} />)}
          <KV label="Summe Einnahmen" value={eur2(inc)} strong />
        </Card>
        <Card>
          <Text style={styles.blockTitle}>Ausgaben</Text>
          {f.expense.map((x, i) => <KV key={i} label={x.label} value={eur2(x.amountEur)} />)}
          <KV label="Summe Ausgaben" value={eur2(exp)} strong />
        </Card>
        <Card style={{ backgroundColor: colors.surfaceDark }}>
          <KV label="Saldo" value={eur2(inc - exp)} strong />
        </Card>
      </View>
    );
  }

  // --- Gebäude: Forderungsliste ---
  if (key === 'receivables') {
    const list = state.receivables || [];
    const total = list.reduce((a, r) => a + r.amountEur, 0);
    return (
      <View>
        {list.map((r) => (
          <Card key={r.id} style={styles.rcRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.cardTitle}>{r.name}</Text>
              <Text style={styles.jSub}>Wohnung {r.unit}</Text>
            </View>
            <Text style={[styles.rcAmt, r.amountEur > 0 ? { color: '#f87171' } : { color: colors.greenText }]}>{eur2(r.amountEur)}</Text>
          </Card>
        ))}
        <Card><KV label="Gesamtforderung" value={eur2(total)} strong /></Card>
      </View>
    );
  }

  // --- Wohnung: Banküberweisungen ---
  if (key === 'transfers') {
    const list = (state.transfers || []).filter((t) => t.tenantId === tid).sort((a, b) => b.at - a.at);
    if (list.length === 0) return <ComingSoon note="Keine Banküberweisungen." />;
    return (
      <View>
        {list.map((t) => (
          <Card key={t.id}>
            <View style={styles.between}>
              <Text style={styles.cardTitle}>{dmy(t.at)}</Text>
              <Text style={styles.rcAmt}>{eur2(t.amountEur)}</Text>
            </View>
            <KV label="Verwendung" value={t.ref} />
            <KV label="IBAN" value={t.iban} last />
          </Card>
        ))}
      </View>
    );
  }

  // --- Wohnung: Online-Zahlungen ---
  if (key === 'online') {
    const list = (state.payments || []).filter((p) => p.tenantId === tid && p.method === 'Online').sort((a, b) => b.at - a.at);
    if (list.length === 0) return <ComingSoon note={'Noch keine Online-Zahlungen. Zahlungen über den Tab „Zahlung“ erscheinen hier.'} />;
    return (
      <View>
        {list.map((p) => (
          <Card key={p.id}>
            <View style={styles.between}>
              <Text style={styles.cardTitle}>{dmy(p.at)}</Text>
              <Text style={[styles.rcAmt, { color: colors.greenText }]}>{eur2(p.amountEur)}</Text>
            </View>
            <KV label="Beleg-Nr." value={p.receiptNo} last />
          </Card>
        ))}
      </View>
    );
  }

  // --- Wohnung: Inkasso-Akten ---
  if (key === 'inkasso') {
    const list = (state.inkassoFiles || []).filter((f) => f.tenantId === tid).sort((a, b) => b.at - a.at);
    if (list.length === 0) return <ComingSoon note="Keine Inkasso-Akten. Sehr gut!" />;
    return (
      <View>
        {list.map((f) => (
          <Card key={f.id} style={f.status === 'open' ? { borderColor: colors.redBorder } : null}>
            <View style={styles.between}>
              <Text style={styles.cardTitle}>Akte {f.caseNo}</Text>
              <Badge label={f.status === 'open' ? 'Offen' : 'Geschlossen'} tone={f.status === 'open' ? 'red' : 'green'} />
            </View>
            <KV label="Datum" value={dmy(f.at)} />
            <KV label="Betrag" value={eur2(f.amountEur)} />
            <KV label="Kanzlei" value={f.office} last />
            {!!f.note && <Text style={styles.bodyText}>{f.note}</Text>}
          </Card>
        ))}
      </View>
    );
  }

  // Schaden melden + Status der eigenen Meldungen
  if (key === 'maengel') {
    return (
      <View>
        {/* Optionales Foto zur nächsten Meldung */}
        <View style={styles.photoBar}>
          <TouchableOpacity style={styles.photoBtn} activeOpacity={0.8} onPress={pickPhoto}>
            <Text style={styles.photoBtnText}>📷 {photo ? 'Foto ändern' : 'Foto hinzufügen'}</Text>
          </TouchableOpacity>
          {!!photo && <Image source={{ uri: photo }} style={styles.photoThumb} />}
        </View>
        <Button label="＋ Neuen Schaden melden" tone="gold" onPress={() => setMaengelOpen(true)} />
        <View style={{ height: spacing.md }} />
        {(!myJobs || myJobs.length === 0) ? (
          <ComingSoon note="Sie haben noch keine Schäden gemeldet." />
        ) : (
          myJobs.map((j) => {
            const js = JOB_STATUS[j.status] || JOB_STATUS.open;
            const accepted = (j.offers || []).find((o) => o.status === 'accepted');
            return (
              <Card key={j.id}>
                <View style={styles.between}>
                  <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
                    <Text style={{ fontSize: 20 }}>{jobIcon(j.category)}</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.cardTitle}>{j.title}</Text>
                      <Text style={styles.jSub}>{dmy(j.at)}</Text>
                    </View>
                  </View>
                  <Badge label={js.label} tone={js.tone} />
                </View>
                {!!j.description && <Text style={styles.jDesc}>{j.description}</Text>}
                {!!j.photo && <Image source={{ uri: j.photo }} style={styles.jobPhoto} />}
                <Text style={styles.jStatus}>
                  {j.status === 'open' && `${(j.offers || []).length} Angebot(e) · wartet auf Freigabe des Eigentümers`}
                  {j.status === 'assigned' && accepted && `Vergeben · ${eur(accepted.priceEur)}`}
                  {j.status === 'done' && 'Reparatur abgeschlossen ✓'}
                </Text>
              </Card>
            );
          })
        )}
      </View>
    );
  }


  // Borç Listesi – detaillierte Schuldenposten mit Summen
  if (key === 'debtlist') {
    if (!myDebts || myDebts.length === 0) return <ComingSoon note="Keine offenen Schuldenposten." />;
    const sum = myDebts.reduce((a, d) => a + d.amountEur, 0);
    const sur = myDebts.reduce((a, d) => a + d.surchargeEur, 0);
    const st = STATUS_LABEL;
    return (
      <View>
        {myDebts.map((d) => {
          const s = st[d.status] || st.this_month;
          return (
            <Card key={d.id}>
              <View style={styles.between}>
                <View>
                  <Text style={styles.hLabel}>STATUS</Text>
                  <Text style={[styles.hValue, { color: s.color }]}>{s.label}</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={styles.hLabel}>FÄLLIG AM</Text>
                  <Text style={styles.hValue}>{dmy(d.dueDate)}</Text>
                </View>
              </View>
              <View style={styles.dashed} />
              <Text style={styles.hLabel}>INFO</Text>
              <Text style={styles.infoText}>{d.info}</Text>
              <View style={styles.dashed} />
              <View style={styles.threeCol}>
                <View><Text style={styles.hLabel}>BETRAG</Text><Text style={styles.colVal}>{eur2(d.amountEur)}</Text></View>
                <View style={{ alignItems: 'center' }}><Text style={styles.hLabel}>ZUSCHLAG</Text><Text style={styles.colVal}>{eur2(d.surchargeEur)}</Text></View>
                <View style={{ alignItems: 'flex-end' }}><Text style={styles.hLabel}>ZU ZAHLEN</Text><Text style={styles.colVal}>{eur2(d.amountEur + d.surchargeEur)}</Text></View>
              </View>
            </Card>
          );
        })}
        <Card>
          <TotalRow label="Gesamtbetrag" value={eur2(sum)} />
          <TotalRow label="Gesamt-Zuschlag" value={eur2(sur)} />
          <TotalRow label="Gesamt zu zahlen" value={eur2(sum + sur)} strong />
        </Card>
      </View>
    );
  }

  // Ödeme Listesi – geleistete Zahlungen mit Summe
  if (key === 'payments') {
    if (!myPayments || myPayments.length === 0) return <ComingSoon note="Noch keine Zahlungen erfasst." />;
    const total = myPayments.reduce((a, p) => a + p.amountEur, 0);
    return (
      <View>
        {myPayments.map((p) => (
          <Card key={p.id}>
            <View style={styles.between}>
              <View><Text style={styles.hLabel}>DATUM</Text><Text style={styles.hValue}>{dmy(p.at)}</Text></View>
              <View style={{ alignItems: 'flex-end' }}><Text style={styles.hLabel}>ZAHLART</Text><Text style={styles.hValue}>{p.method === 'Bank' ? 'Bank' : 'Kasse'}</Text></View>
            </View>
            <View style={styles.dashed} />
            <View style={styles.between}>
              <View style={{ flex: 1 }}><Text style={styles.hLabel}>BELEG-NR.</Text><Text style={styles.receipt}>{p.receiptNo}</Text></View>
              <View style={{ alignItems: 'flex-end' }}><Text style={styles.hLabel}>BEZAHLT</Text><Text style={styles.paidVal}>{eur2(p.amountEur)}</Text></View>
            </View>
          </Card>
        ))}
        <Card>
          <TotalRow label="Gesamt bezahlt" value={eur2(total)} strong />
        </Card>
      </View>
    );
  }

  if (key === 'messages') {
    if (!myMessages || myMessages.length === 0) return <ComingSoon note="Sie haben noch keine Nachrichten." />;
    return (
      <View style={{ marginHorizontal: -spacing.lg }}>
        {myMessages.map((m) => (
          <MessageCard
            key={m.id}
            date={when(m.at)}
            party={nameFor(m.fromUserId)}
            partyLabel="Absender"
            text={m.text}
          />
        ))}
      </View>
    );
  }

  if (key === 'debts') {
    if (!tenant) return <ComingSoon note="Kein Miet-Datensatz verknüpft." />;
    const overdue = tenant.status === 'overdue';
    return (
      <Card style={overdue ? { borderColor: colors.redBorder, backgroundColor: '#1a1013' } : null}>
        <View style={styles.between}>
          <Text style={styles.cardTitle}>{tenant.propertyName}</Text>
          <Badge label={overdue ? 'Überfällig' : 'Bezahlt'} tone={overdue ? 'red' : 'green'} />
        </View>
        {overdue ? (
          <>
            <Text style={styles.debtLine}>Offener Betrag: {eur(tenant.overdueEur)}</Text>
            <Text style={styles.debtSub}>seit {tenant.overdueDays} Tagen</Text>
            <Button label="Jetzt bezahlen" tone="green" onPress={() => setPayOpen(true)} />
          </>
        ) : (
          <Text style={styles.ok}>✓ Keine offenen Schulden.</Text>
        )}
      </Card>
    );
  }

  if (key === 'payments') {
    if (!tenant || tenant.log.length === 0) return <ComingSoon note="Noch keine Zahlungen erfasst." />;
    return (
      <Card>
        {tenant.log.map((e, i) => (
          <View key={i} style={styles.logRow}>
            <Text style={styles.logText}>{e.text}</Text>
            <Text style={styles.logDate}>{when(e.at)}</Text>
          </View>
        ))}
      </Card>
    );
  }

  // Alle übrigen Bereiche: Platzhalter (Inhalt folgt)
  return <ComingSoon />;
}

function KV({ label, value, strong, last }) {
  return (
    <View style={[styles.kvRow, last && { borderBottomWidth: 0 }]}>
      <Text style={styles.kvLabel}>{label}</Text>
      <Text style={[styles.kvValue, strong && { color: colors.goldSoft, fontWeight: '800' }]}>{value}</Text>
    </View>
  );
}

function Tile({ label, value, tone }) {
  const c = tone === 'red' ? '#f87171' : tone === 'green' ? colors.greenText : tone === 'gold' ? colors.goldSoft : colors.text;
  return (
    <View style={styles.tile}>
      <Text style={[styles.tileValue, { color: c }]}>{value}</Text>
      <Text style={styles.tileLabel}>{label}</Text>
    </View>
  );
}

function TotalRow({ label, value, strong }) {
  return (
    <View style={styles.totalRow}>
      <Text style={[styles.totalLabel, strong && { color: colors.text }]}>{label}</Text>
      <Text style={[styles.totalValue, strong && { color: colors.goldSoft, fontSize: font.h3 }]}>{value}</Text>
    </View>
  );
}

function ComingSoon({ note }) {
  return (
    <Card style={{ alignItems: 'center', paddingVertical: spacing.xl }}>
      <Text style={{ fontSize: 30, marginBottom: spacing.sm }}>🚧</Text>
      <Text style={styles.soonTitle}>Inhalt folgt in Kürze</Text>
      <Text style={styles.soonSub}>{note || 'Dieser Bereich wird als Nächstes gefüllt.'}</Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.lg, paddingBottom: spacing.xl },

  hero: {
    backgroundColor: colors.blue,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  heroHi: { color: 'rgba(255,255,255,0.85)', fontSize: font.body },
  heroName: { color: '#fff', fontSize: font.h1, fontWeight: '900', marginTop: 2 },
  heroAddr: { color: 'rgba(255,255,255,0.8)', fontSize: font.small, marginTop: spacing.xs },

  groupTitle: { color: colors.textMuted, fontSize: font.small, fontWeight: '800', letterSpacing: 0.5, marginTop: spacing.md, marginBottom: spacing.sm },
  row: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1, borderColor: colors.border,
    paddingVertical: spacing.md, paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
  },
  rowIcon: { width: 38, height: 38, borderRadius: radius.sm, backgroundColor: colors.surfaceAlt, alignItems: 'center', justifyContent: 'center' },
  rowLabel: { color: colors.text, fontSize: font.body, fontWeight: '700' },
  rowHint: { color: colors.textFaint, fontSize: font.tiny, marginTop: 1 },
  chevron: { color: colors.textFaint, fontSize: font.h2, marginLeft: spacing.xs },

  back: { marginBottom: spacing.sm },
  backText: { color: colors.blueSoft, fontSize: font.body, fontWeight: '700' },
  detailTitle: { color: colors.text, fontSize: font.h2, fontWeight: '800', marginBottom: spacing.md },

  between: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.md },
  cardTitle: { color: colors.text, fontSize: font.h3, fontWeight: '700' },
  jSub: { color: colors.textFaint, fontSize: font.tiny, marginTop: 1 },
  jDesc: { color: colors.textMuted, fontSize: font.small, lineHeight: 18, marginBottom: spacing.sm },
  jStatus: { color: colors.blueSoft, fontSize: font.small, fontWeight: '600' },
  bodyText: { color: colors.textMuted, fontSize: font.small, lineHeight: 19, marginTop: spacing.sm },

  kvRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.border, gap: spacing.md },
  kvLabel: { color: colors.textMuted, fontSize: font.small },
  kvValue: { color: colors.text, fontSize: font.small, fontWeight: '700', flex: 1, textAlign: 'right' },

  blockTitle: { color: colors.text, fontSize: font.body, fontWeight: '800', marginBottom: spacing.xs },
  periodLabel: { color: colors.textMuted, fontSize: font.small, fontWeight: '700', marginHorizontal: spacing.lg, marginBottom: spacing.sm, textTransform: 'uppercase', letterSpacing: 0.5 },

  tiles: { flexDirection: 'row', gap: spacing.sm, marginHorizontal: spacing.lg, marginBottom: spacing.sm },
  tile: { flex: 1, backgroundColor: colors.surface, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, padding: spacing.md, alignItems: 'center' },
  tileValue: { fontSize: font.h2, fontWeight: '900', fontVariant: ['tabular-nums'] },
  tileLabel: { color: colors.textMuted, fontSize: font.tiny, marginTop: 2 },

  rcRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  rcAmt: { color: colors.text, fontSize: font.h3, fontWeight: '800', fontVariant: ['tabular-nums'] },

  photoBar: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginBottom: spacing.md },
  photoBtn: { flex: 1, backgroundColor: colors.surfaceAlt, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, paddingVertical: spacing.md, alignItems: 'center' },
  photoBtnText: { color: colors.text, fontSize: font.body, fontWeight: '700' },
  photoThumb: { width: 48, height: 48, borderRadius: radius.sm, backgroundColor: colors.surfaceAlt },
  jobPhoto: { width: '100%', height: 160, borderRadius: radius.md, backgroundColor: colors.surfaceAlt, marginBottom: spacing.sm },
  debtLine: { color: '#f87171', fontSize: font.h3, fontWeight: '800' },
  debtSub: { color: colors.textMuted, fontSize: font.small, marginBottom: spacing.md },
  ok: { color: colors.greenText, fontSize: font.body, fontWeight: '600' },

  logRow: { paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.border },
  logText: { color: colors.text, fontSize: font.body },
  logDate: { color: colors.textFaint, fontSize: font.tiny, marginTop: 2 },

  soonTitle: { color: colors.text, fontSize: font.h3, fontWeight: '700' },
  soonSub: { color: colors.textMuted, fontSize: font.small, marginTop: spacing.xs, textAlign: 'center' },

  // Borç / Ödeme Listesi
  hLabel: { color: colors.textFaint, fontSize: font.tiny, fontWeight: '700', letterSpacing: 0.5 },
  hValue: { color: colors.text, fontSize: font.body, fontWeight: '700', marginTop: 1 },
  dashed: { height: 1, borderBottomWidth: 1, borderStyle: 'dashed', borderColor: colors.border, marginVertical: spacing.sm },
  infoText: { color: colors.text, fontSize: font.body, marginTop: 2, lineHeight: 20 },
  threeCol: { flexDirection: 'row', justifyContent: 'space-between' },
  colVal: { color: colors.text, fontSize: font.body, fontWeight: '800', marginTop: 2, fontVariant: ['tabular-nums'] },
  receipt: { color: colors.textMuted, fontSize: font.body, marginTop: 2, fontVariant: ['tabular-nums'] },
  paidVal: { color: colors.greenText, fontSize: font.h3, fontWeight: '800', marginTop: 2, fontVariant: ['tabular-nums'] },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: spacing.xs },
  totalLabel: { color: colors.textMuted, fontSize: font.body, fontWeight: '600' },
  totalValue: { color: colors.text, fontSize: font.body, fontWeight: '800', fontVariant: ['tabular-nums'] },
});
