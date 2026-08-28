// Handwerker/Firma – offene Ausschreibungen: Angebot senden (Eigentümer entscheidet)
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image } from 'react-native';
import { ScreenHeader, Card, Badge, Button } from '../components/UI';
import { FormModal } from '../components/Modals';
import { useStore } from '../store/store';
import { eur, when, jobIcon } from '../utils';
import { colors, spacing, radius, font } from '../theme';

const OFFER_STATUS = {
  pending: { label: 'Ausstehend', tone: 'gold' },
  accepted: { label: '✓ Angenommen', tone: 'green' },
  rejected: { label: 'Abgelehnt', tone: 'red' },
};

export default function JobsScreen() {
  const { state, actions, currentUser } = useStore();
  const [offerJob, setOfferJob] = useState(null);

  const cid = currentUser?.craftsmanId;
  const jobs = state.jobs || [];
  const myOffer = (j) => (j.offers || []).find((o) => o.craftsmanId === cid);

  const openJobs = jobs.filter((j) => j.status === 'open');
  const myOffers = jobs
    .map((j) => ({ job: j, offer: myOffer(j) }))
    .filter((x) => x.offer);
  const assigned = jobs.filter((j) => {
    const o = myOffer(j);
    return o && o.status === 'accepted' && (j.status === 'assigned' || j.status === 'done');
  });

  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <ScreenHeader title="Aufträge" titleAr="طلبات العمل" subtitle="Angebote senden – der Eigentümer entscheidet" />

      {/* Offene Ausschreibungen */}
      <Text style={styles.section}>Offene Ausschreibungen ({openJobs.length})</Text>
      {openJobs.length === 0 && <Card><Text style={styles.muted}>Aktuell keine offenen Ausschreibungen.</Text></Card>}
      {openJobs.map((j) => {
        const mine = myOffer(j);
        return (
          <Card key={j.id}>
            <View style={styles.rowTop}>
              <Text style={styles.jIcon}>{jobIcon(j.category)}</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.jTitle}>{j.title}</Text>
                <Text style={styles.jSub}>{j.propertyName}{j.city ? ` · ${j.city}` : ''}</Text>
              </View>
            </View>
            {!!j.description && <Text style={styles.jDesc}>{j.description}</Text>}
            {!!j.photo && <Image source={{ uri: j.photo }} style={styles.jobPhoto} />}
            {mine ? (
              <View style={styles.offerRow}>
                <Text style={styles.offerText}>Ihr Angebot: {eur(mine.priceEur)}</Text>
                <Badge label={OFFER_STATUS[mine.status].label} tone={OFFER_STATUS[mine.status].tone} />
              </View>
            ) : (
              <Button label="Angebot senden" tone="blue" onPress={() => setOfferJob(j)} />
            )}
          </Card>
        );
      })}

      {/* Meine Angebote (Status = Rückmeldung an mich) */}
      {myOffers.length > 0 && (
        <>
          <Text style={styles.section}>Meine Angebote</Text>
          {myOffers.map(({ job, offer }) => (
            <Card key={offer.id}>
              <View style={styles.between}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.jTitle}>{job.title}</Text>
                  <Text style={styles.jSub}>{job.propertyName} · {eur(offer.priceEur)}</Text>
                </View>
                <Badge label={OFFER_STATUS[offer.status].label} tone={OFFER_STATUS[offer.status].tone} />
              </View>
              {offer.status === 'rejected' && <Text style={styles.rejNote}>Der Eigentümer hat ein anderes Angebot gewählt.</Text>}
              {offer.status === 'accepted' && <Text style={styles.accNote}>Glückwunsch! Ihr Angebot wurde angenommen.</Text>}
            </Card>
          ))}
        </>
      )}

      {/* Angenommene Aufträge */}
      {assigned.length > 0 && (
        <>
          <Text style={styles.section}>Angenommene Aufträge</Text>
          {assigned.map((j) => (
            <Card key={j.id}>
              <View style={styles.between}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.jTitle}>{j.title}</Text>
                  <Text style={styles.jSub}>{j.propertyName} · {eur(myOffer(j).priceEur)}</Text>
                </View>
                <Badge label={j.status === 'done' ? '✓ Erledigt' : 'Aktiv'} tone={j.status === 'done' ? 'green' : 'blue'} />
              </View>
              {j.status !== 'done' && <Button label="Als erledigt markieren" tone="green" onPress={() => actions.completeJob(j.id)} />}
            </Card>
          ))}
        </>
      )}

      <View style={{ height: spacing.xl }} />

      {/* Angebot abgeben */}
      <FormModal
        visible={!!offerJob}
        title={offerJob ? `Angebot: ${offerJob.title}` : ''}
        submitLabel="Angebot senden"
        fields={[
          { key: 'price', label: 'Ihr Preis (€)', placeholder: 'z. B. 300', numeric: true },
          { key: 'note', label: 'Notiz (optional)', placeholder: 'z. B. inkl. Material, 1 Tag' },
        ]}
        onSubmit={(v) => actions.makeOffer(offerJob.id, v.price, v.note)}
        onClose={() => setOfferJob(null)}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { paddingTop: spacing.sm, paddingBottom: spacing.xl },
  muted: { color: colors.textMuted, fontSize: font.body },
  section: { color: colors.textMuted, fontSize: font.small, fontWeight: '800', letterSpacing: 0.5, marginHorizontal: spacing.lg, marginTop: spacing.md, marginBottom: spacing.sm, textTransform: 'uppercase' },

  rowTop: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  between: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginBottom: spacing.sm },
  jIcon: { fontSize: 22, width: 28, textAlign: 'center' },
  jTitle: { color: colors.text, fontSize: font.body, fontWeight: '800' },
  jSub: { color: colors.textFaint, fontSize: font.small, marginTop: 2 },
  jDesc: { color: colors.textMuted, fontSize: font.small, lineHeight: 18, marginVertical: spacing.md },
  jobPhoto: { width: '100%', height: 160, borderRadius: radius.md, backgroundColor: colors.surfaceAlt, marginBottom: spacing.md },

  offerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: spacing.md },
  offerText: { color: colors.text, fontSize: font.body, fontWeight: '700' },
  rejNote: { color: '#f87171', fontSize: font.small, marginTop: spacing.sm },
  accNote: { color: colors.greenText, fontSize: font.small, marginTop: spacing.sm },
});
