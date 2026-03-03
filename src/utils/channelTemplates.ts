import { ThreadChannel } from 'discord.js'

export default async function templates(thread: ThreadChannel) {
    // Template for '#pr-kontakt'
    if (thread.parent?.name === 'pr-kontakt') {
        const lines = [
            '## Frist for å be om promotering er 2 uker!',
            'Ved å ikke følge denne regelen vil ikke arrangementet ditt bli promotert',
            '**På både norsk og engelsk:**',
            '```',
            'Tittel: Thread tittel skal være arrangement / grunn for kontakt',
            'Sted (Hvor skjer det?):',
            'Dato og klokkeslett (Når skjer det?):',
            'Beskrivelse/promotekst (Hva er det?):',
            'Vi vil etterspørre en bedre promoteringstekst ved tydelig latskap.',
            'Release dato (Når er det ønsket at promo postes?):',
            'Frist for påmelding:',
            'Påmeldingslenke:',
            'Kapasitet:',
            'Hvordan du ønsker at det skal promoteres:',
            'Ved å ikke følge malen, så vil ikke arrangementet bli promotert:',
            '```',
        ]
        const content = lines.join('\n')
        return await thread.send({ content })
    }

    // Template for '#saker-til-styremøter'
    if (thread.parent?.name === 'saker-til-styremøter') {
        const content = [
            'Husk å ha med:',
            '```',
            'Type sak: O / D / V - ',
            'Beskrivelse av saken.',
            '',
            'Eksempel:',
            'D - Nytt format av saker',
            'Denne linjen og resten av meldingen er innholdet i saken.',
            '```',
            'Dersom du ønsker å redigere en sak må du redigere samme melding. ' +
            'Flere meldinger for samme sak vil ikke komme med. ' +
            'Meldinger uten type vil heller ikke komme med. ' +
            'Slike meldinger antas å være urelevant diskusjon.',
        ].join('\n')
        return await thread.send({ content })
    }

    // Template for '#refunderinger'
    if (thread.parent?.name === 'refunderinger') {
        const content = `Kvittering SKAL ha følgende for å bli godkjent:
\`\`\`
Dato for kjøp
Organisasjonsnummer til selger
Kvitteringsnummer
Hvem som har kjøpt
Hvem som har solgt
Betalingsform (Vipps, Visa)
MVA: (12%, 15%, 25%)
Totalsum (med og uten MVA)
Hva som er kjøpt (fritekst)
PDF til kvittering som vedlegg
Vedtektssak (MED URL)
Kontonummer
\`\`\``
        return await thread.send({ content })
    }
}
