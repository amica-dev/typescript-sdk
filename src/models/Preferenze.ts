/* tslint:disable */
/* eslint-disable */
/**
 * Amica Cloud API
 * L\'Amica Cloud API fornisce accesso programmatico a tutti i dati aziendali gestiti da [Amica 20](https://gestionaleamica.com). Supporta il ciclo completo di documenti, fatture, magazzino, contabilità e anagrafiche. Per guide e documentazione completa, visitare [amica.dev](https://amica.dev/).  ## Autenticazione  Tutte le richieste API richiedono un token OAuth 2.0 Bearer valido, da includere nell\'header `Authorization`:  ``` Authorization: Bearer <token> ```  ### Registra la tua app  Per integrare l\'Amica Cloud API registra la tua applicazione sull\'[**App Store di Amica**](https://apps.amica20.it). Al termine della registrazione ottieni una coppia di credenziali OAuth 2.0 — `client_id` e `client_secret` (il secret è mostrato **una sola volta**) — e scegli gli **scope** e il **flusso di autenticazione** desiderati.  ### Scegli il flusso  La scelta dipende da **come** la tua applicazione si autentica:  - C\'è un **utente** che può accedere via browser (web app, SPA, app mobile)? → **Authorization Code con PKCE**. - È un **servizio headless** (backend, batch, integrazione server-to-server) di una **singola azienda**, senza un utente che effettua il login? → **Client Credentials**.  #### Authorization Code con PKCE  Consigliato per le app che operano per conto di un utente Amica ed è l\'**unico flusso disponibile per le app pubblicate sul marketplace**. Una sola registrazione serve un numero qualsiasi di aziende: ogni utente autorizza la tua app per la propria azienda tramite la pagina di consenso dell\'identity provider, e il token riceve automaticamente il contesto di quell\'azienda. La tua app riceve un `code` da scambiare con un access token.  ``` GET  {identity-provider}/connect/authorize?response_type=code&client_id=<client_id>&redirect_uri=<redirect_uri>&scope=openid%20read%20write%20documenti&code_challenge=<challenge>&code_challenge_method=S256 POST {identity-provider}/connect/token      grant_type=authorization_code&code=<code>&code_verifier=<verifier>&client_id=<client_id>&client_secret=<client_secret>&redirect_uri=<redirect_uri> ```  #### Client Credentials  Per integrazioni **server-to-server** senza utente interattivo. Disponibile solo per le **app private**, non per quelle pubblicate sul marketplace. Un\'app Client Credentials è **legata a una singola azienda** — quella dell\'utente che la registra — e il token ne riceve automaticamente il contesto. Per servire un\'azienda diversa serve una registrazione separata; se devi distribuire la stessa app a più aziende usa invece **Authorization Code**.  ``` POST {identity-provider}/connect/token Content-Type: application/x-www-form-urlencoded  grant_type=client_credentials&client_id=<client_id>&client_secret=<client_secret>&scope=comune read write documenti ```  > **Importante:** non includere lo scope `openid` (né `profile`/`email`) in questo flusso. `openid` attiva OpenID Connect — richiede un utente che effettua il login e l\'emissione di un ID token — cosa che un flusso server-to-server non prevede: la richiesta viene rifiutata con l\'errore `Client cannot request OpenID scopes in client credentials flow`. Indica solo gli scope di risorsa (`comune`, `magazzino`, `documenti`, `contabilita`, ed eventualmente `read`/`write`).  In entrambi i casi la risposta contiene l\'`access_token` (JWT con `aud: amica-cloud`) da usare nelle chiamate successive finché non scade (`expires_in`), dopodiché va richiesto un nuovo token. Ogni token contiene uno o più **scope** che determinano le aree accessibili (vedi sotto). Dalla [API Reference](https://amica.dev) è possibile incollare un access token per provare gli endpoint direttamente dal browser.  ## Scope di autorizzazione  L\'accesso agli endpoint è governato dagli scope presenti nel token OAuth:  | Scope | Descrizione | |-|-| | `comune` | Anagrafiche: contatti, indirizzi, nazioni, valute, modalità di pagamento, ecc. | | `magazzino` | Magazzino: articoli, listini, movimenti di magazzino, giacenze, distinte base. | | `contabilita` | Contabilità: registrazioni contabili, scadenze, castelletti IVA, fatture elettroniche XML. | | `documenti` | Documenti: fatture, note di credito, DDT, ordini, preventivi, proforma ed emissione. |  Una richiesta verso un endpoint non coperto dallo scope del token riceverà una risposta `403 Forbidden`.  ## Company ID  La maggior parte degli endpoint è relativa a una specifica azienda e segue il pattern:  ``` /api/v3/{companyId}/risorsa ```  Il `companyId` è l\'identificativo univoco di ciascun database aziendale. Usare l\'endpoint `GET /api/v3/config/Azienda` per ottenere l\'elenco delle aziende disponibili.  ## Paginazione  Gli endpoint che restituiscono liste supportano la paginazione tramite query parameter:  | Parametro | Descrizione | |-|-| | `Skip` | Numero di elementi da saltare dall\'inizio del set di risultati. | | `Take` | Numero di elementi da includere nella risposta. |  La risposta include due header:  | Header | Descrizione | |-|-| | `X-Read-TotalCount` | Numero totale di elementi che soddisfano il filtro corrente. | | `X-Read-Count` | Numero di elementi effettivamente restituiti nel body della risposta. |  ## Ordinamento e filtri  Gli endpoint lista accettano parametri aggiuntivi:  | Parametro | Descrizione | |-|-| | `Order` | Lista di proprietà per l\'ordinamento, separate da virgola. Un segno meno (`-`) prima del nome indica ordine discendente. Es. `-RagioneSociale1,Citta`. | | `Filter` | Condizioni di ricerca: lista di espressioni separate da virgola, ciascuna formata da nome campo, operatore, valore ed eventuale connettore logico. Operatori: `$eq`, `$ne`, `$gt`, `$lt`, `$lte`, `$gte`, `$ct` (contiene), `$nct`, `$sw` (inizia con), `$ew` (finisce con). Connettori: `$and` (default, omissibile) e `$or`; le sotto-query si racchiudono tra `[]`. Es. `RagioneSociale1 $ct acme $or, Fido $gt 1000`. | | `SkipTotalCount` | Se `true`, l\'header `X-Read-TotalCount` viene omesso dalla risposta: migliori prestazioni a scapito del conteggio totale. Default `false`. |  ## Espansione oggetti correlati  Gli endpoint singoli e lista supportano il parametro `Expand`. Quando fornito, gli oggetti correlati vengono inclusi inline nella risposta anziché restituiti come riferimenti. È possibile specificare espansioni multiple separate da virgola.  ## Gestione errori  L\'API usa codici di stato HTTP standard e restituisce [RFC 7807](https://tools.ietf.org/html/rfc7807) Problem Details in caso di errore:  | Codice | Significato | |-|-| | `400` | Bad Request — validazione fallita o parametro obbligatorio mancante. | | `401` | Unauthorized — token mancante o scaduto. | | `403` | Forbidden — il token non possiede lo scope richiesto. | | `404` | Not Found — la risorsa richiesta non esiste. | | `409` | Conflict — conflitto di concorrenza. | | `422` | Unprocessable Entity — entità non processabile (es. token di concorrenza obsoleto). |  Il motivo dell\'errore è sempre nel campo `detail`. Ogni risposta di errore riporta inoltre `overridable`: quando vale `true`, l\'errore di validazione è *forzabile* e basta ripetere la stessa richiesta aggiungendo `validationOverride=true` alla query string perché il servizio la accetti. È il caso delle anomalie formali su dati reali — la partita IVA di un fornitore estero, per esempio — che il cliente ha comunque bisogno di registrare.  ## Controllo della concorrenza  Le entità contengono una proprietà `ConcurrencyToken`. Quando si aggiorna un\'entità tramite `PUT`, il token nel body della richiesta viene confrontato con il valore memorizzato. Se differiscono, viene restituito un `422 Unprocessable Entity`. Usare sempre l\'ultimo token ricevuto da una risposta `GET` o `POST`. 
 *
 * The version of the OpenAPI document: 3.0.1
 * Contact: assistenza@gestionaleamica.com
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */

import { mapValues } from '../runtime';
import type { SedeAltra } from './SedeAltra';
import {
    SedeAltraFromJSON,
    SedeAltraFromJSONTyped,
    SedeAltraToJSON,
    SedeAltraToJSONTyped,
} from './SedeAltra';
import type { RicercaArticolo } from './RicercaArticolo';
import {
    RicercaArticoloFromJSON,
    RicercaArticoloFromJSONTyped,
    RicercaArticoloToJSON,
    RicercaArticoloToJSONTyped,
} from './RicercaArticolo';
import type { SedeLegale } from './SedeLegale';
import {
    SedeLegaleFromJSON,
    SedeLegaleFromJSONTyped,
    SedeLegaleToJSON,
    SedeLegaleToJSONTyped,
} from './SedeLegale';
import type { ImpostazioniSdi } from './ImpostazioniSdi';
import {
    ImpostazioniSdiFromJSON,
    ImpostazioniSdiFromJSONTyped,
    ImpostazioniSdiToJSON,
    ImpostazioniSdiToJSONTyped,
} from './ImpostazioniSdi';
import type { SedeOperativa } from './SedeOperativa';
import {
    SedeOperativaFromJSON,
    SedeOperativaFromJSONTyped,
    SedeOperativaToJSON,
    SedeOperativaToJSONTyped,
} from './SedeOperativa';

/**
 * Preferenze aziendali.
 * @export
 * @interface Preferenze
 */
export interface Preferenze {
    /**
     * Identificativo univoco.
     * @type {number}
     * @memberof Preferenze
     */
    id?: number;
    /**
     * Il token di concorrenza implementa il controllo di concorrenza ottimistica: a ogni operazione di aggiornamento o cancellazione il valore del token sul database viene confrontato con quello sull'entità. Se i valori coincidono, l'operazione viene eseguita; se differiscono, si assume che un altro utente abbia effettuato una scrittura nel frattempo e l'aggiornamento viene rifiutato.
     * @type {number}
     * @memberof Preferenze
     */
    concurrencyToken?: number;
    /**
     * Ragione sociale.
     * @type {string}
     * @memberof Preferenze
     */
    ragioneSociale1?: string | null;
    /**
     * Eventuale seconda riga della ragione sociale. Utile soprattutto in fase di stampa, quando si desidera spezzare una ragione sociale molto lunga su due righe distinte.
     * @type {string}
     * @memberof Preferenze
     */
    ragioneSociale2?: string | null;
    /**
     * Partita IVA.
     * @type {string}
     * @memberof Preferenze
     */
    partitaIva?: string | null;
    /**
     * Numero di iscrizione al Registro Imprese.
     * @type {string}
     * @memberof Preferenze
     */
    registroImprese?: string | null;
    /**
     * Codice fiscale.
     * @type {string}
     * @memberof Preferenze
     */
    codiceFiscale?: string | null;
    /**
     * Codice SIA.
     * @type {string}
     * @memberof Preferenze
     */
    codiceSia?: string | null;
    /**
     * Codice REA.
     * @type {string}
     * @memberof Preferenze
     */
    codiceRea?: string | null;
    /**
     * Indica se l'organizzazione è una persona giuridica oppure no. `true` indica una persona giuridica, `false` indica una persona fisica.
     * @type {boolean}
     * @memberof Preferenze
     */
    personaGiuridica?: boolean;
    /**
     * Data di nascita (persona fisica).
     * @type {Date}
     * @memberof Preferenze
     */
    dataNascita?: Date | null;
    /**
     * Luogo di nascita (persona fisica).
     * @type {string}
     * @memberof Preferenze
     */
    localitaNascita?: string | null;
    /**
     * Provincia di nascita (persona fisica).
     * @type {string}
     * @memberof Preferenze
     */
    provinciaNascita?: string | null;
    /**
     * Sesso (persona fisica).
     * @type {string}
     * @memberof Preferenze
     */
    sesso?: string | null;
    /**
     * Tipo di attività svolta dall'azienda o dalla persona fisica.
     * @type {string}
     * @memberof Preferenze
     */
    attivita?: string | null;
    /**
     * Indica se, in modo predefinito, i prezzi riportati sui documenti fiscali devono essere considerati al netto dell'IVA. Se `false`, l'IVA viene applicata ai prezzi quando possibile.
     * @type {boolean}
     * @memberof Preferenze
     */
    ivaEsclusa?: boolean;
    /**
     * Numero di decimali ammessi nei prezzi unitari. Minimo 1, massimo 5.
     * @type {number}
     * @memberof Preferenze
     */
    decimaliPrezzoUnitario?: number;
    /**
     * Identificativo univoco di `CausaleMagazzino`
     * Identificativo univoco della `CausaleMagazzino` da usare nella produzione di componenti.
     * @type {number}
     * @memberof Preferenze
     */
    causaleProduzioneComponentiId?: number | null;
    /**
     * Identificativo univoco della `CausaleMagazzino` da usare per gli articoli composti nella produzione di componenti.
     * @type {number}
     * @memberof Preferenze
     */
    causaleProduzioneCompostiId?: number | null;
    /**
     * Identificativo univoco della `CausaleMagazzino` da usare nei documenti di vendita.
     * @type {number}
     * @memberof Preferenze
     */
    causaleMagazzinoVenditaId?: number | null;
    /**
     * Identificativo univoco della `CausaleMagazzino` da usare nei documenti di acquisto.
     * @type {number}
     * @memberof Preferenze
     */
    causaleMagazzinoAcquistoId?: number | null;
    /**
     * 
     * @type {RicercaArticolo}
     * @memberof Preferenze
     */
    ricercaArticolo?: RicercaArticolo;
    /**
     * Eventuali scadenze che cadono in questa data verranno posticipate del numero di giorni indicato da `GiorniExtraDataSpeciale1`.
     * @type {string}
     * @memberof Preferenze
     */
    dataSpeciale1?: string | null;
    /**
     * Eventuali scadenze che cadono in questa data verranno posticipate del numero di giorni indicato da `GiorniExtraDataSpeciale2`.
     * @type {string}
     * @memberof Preferenze
     */
    dataSpeciale2?: string | null;
    /**
     * Numero di giorni da aggiungere a `DataSpeciale1`.
     * @type {number}
     * @memberof Preferenze
     */
    giorniExtraDataSpeciale1?: number | null;
    /**
     * Numero di giorni da aggiungere a `DataSpeciale1`.
     * @type {number}
     * @memberof Preferenze
     */
    giorniExtraDataSpeciale2?: number | null;
    /**
     * Indica se il pagamento delle scadenze viene gestito manualmente. Se `false`, lo stato del pagamento viene determinato in base alle registrazioni contabili (il modulo <a href="https://gestionaleamica.com/Software/ContabilitaOrdinaria">Contabilità</a> deve essere attivo).
     * @type {boolean}
     * @memberof Preferenze
     */
    pagatoManuale?: boolean;
    /**
     * Identificativo della `CausaleMagazzino` predefinita nei movimenti merci.
     * @type {number}
     * @memberof Preferenze
     */
    causaleMagazzinoMerciId?: number | null;
    /**
     * Identificativo del `Magazzino` predefinito nei movimenti merci.
     * @type {number}
     * @memberof Preferenze
     */
    magazzinoMerciId?: number | null;
    /**
     * Identificativo del `Listino` predefinito nei movimenti merci.
     * @type {number}
     * @memberof Preferenze
     */
    listinoMerciId?: number | null;
    /**
     * Identificativo della `ModalitaPagamento` predefinita nei movimenti merci.
     * @type {number}
     * @memberof Preferenze
     */
    modalitaPagamentoMerciId?: number | null;
    /**
     * Identificativo della `CausaleIva` predefinita nei documenti fiscali.
     * @type {number}
     * @memberof Preferenze
     */
    documentiCausaleIvaId?: number | null;
    /**
     * Identificativo del `Magazzino` predefinito nei documenti fiscali.
     * @type {number}
     * @memberof Preferenze
     */
    documentiMagazzinoId?: number | null;
    /**
     * `DocumentiListinoId` predefinito nei documenti fiscali.
     * @type {number}
     * @memberof Preferenze
     */
    documentiListinoId?: number | null;
    /**
     * Email aziendale.
     * @type {string}
     * @memberof Preferenze
     */
    eMail?: string | null;
    /**
     * Sito web aziendale.
     * @type {string}
     * @memberof Preferenze
     */
    sitoWeb?: string | null;
    /**
     * Anno contabile corrente (es. '2023').
     * @type {number}
     * @memberof Preferenze
     */
    annoContabile?: number | null;
    /**
     * Unità di misura predefinita.
     * @type {string}
     * @memberof Preferenze
     */
    unitDiMisura?: string | null;
    /**
     * Causale del modello CU (es. 'A').
     * @type {string}
     * @memberof Preferenze
     */
    causalePagamentoModelloCU?: string | null;
    /**
     * 
     * @type {ImpostazioniSdi}
     * @memberof Preferenze
     */
    impostazioniSdi?: ImpostazioniSdi;
    /**
     * Tipo di bilancio predefinito: analitico o sintetico.
     * @type {string}
     * @memberof Preferenze
     */
    tipoBilancio?: PreferenzeTipoBilancioEnum;
    /**
     * Periodicità IVA: mensile o trimestrale.
     * @type {string}
     * @memberof Preferenze
     */
    periodoIva?: PreferenzePeriodoIvaEnum;
    /**
     * Tipo di liquidazione IVA: per competenza o per cassa.
     * @type {string}
     * @memberof Preferenze
     */
    liquidazioneIva?: PreferenzeLiquidazioneIvaEnum;
    /**
     * Indica se si desidera modificare la registrazione contabile creata all'emissione di un documento. Si applica ad Amica20 WebApp e ad Amica 20 per Windows.
     * @type {boolean}
     * @memberof Preferenze
     */
    modificaRegistrazioneContabileAllaEmissione?: boolean;
    /**
     * Indica se l'ottimizzazione per l'emissione di documenti di grandi dimensioni è attiva oppure no. Si applica ad Amica20 per Windows.
     * @type {boolean}
     * @memberof Preferenze
     */
    ottimizzaEmissioneOrdini?: boolean;
    /**
     * Indica se si desidera aggiungere l'anno in corso al numero del documento (es. 1/2022). Si applica ad Amica 20 WebApp e ad Amica 20 per Windows.
     * @type {boolean}
     * @memberof Preferenze
     */
    aggiungiAnnoInCorsoAlNumeroDocumento?: boolean;
    /**
     * Indica se si desidera abilitare l'opzione di modifica dello stato dei DDT. Si applica ad Amica 20 WebApp e ad Amica 20 per Windows.
     * @type {boolean}
     * @memberof Preferenze
     */
    consentiCambioManualeStatoDdt?: boolean;
    /**
     * Testo del messaggio email inviato all'emissione di un documento. Il documento stesso viene allegato al messaggio. Si applica ad Amica 20 per Windows.
     * @type {string}
     * @memberof Preferenze
     */
    emailBody?: string | null;
    /**
     * Indica se inviare un'email all'emissione di un documento.
     * @type {boolean}
     * @memberof Preferenze
     */
    emailAutoSend?: boolean;
    /**
     * Indica se la produzione automatica dei composti è attiva.
     * @type {boolean}
     * @memberof Preferenze
     */
    autoProduzione?: boolean;
    /**
     * 'Codice destinatario' per il sistema fiscale italiano. Utilizzato per il recapito delle fatture elettroniche italiane.
     * @type {string}
     * @memberof Preferenze
     */
    codiceDestinatario?: string | null;
    /**
     * Indirizzo PEC italiano.
     * @type {string}
     * @memberof Preferenze
     */
    pec?: string | null;
    /**
     * `ModelloContabile` predefinito per le note di debito emesse.
     * @type {number}
     * @memberof Preferenze
     */
    modelloVenditeNotaDebitoId?: number | null;
    /**
     * `ModelloContabile` predefinito per le note di credito emesse.
     * @type {number}
     * @memberof Preferenze
     */
    modelloVenditeNotaCreditoId?: number | null;
    /**
     * `ModelloContabile` predefinito per le ricevute fiscali emesse.
     * @type {number}
     * @memberof Preferenze
     */
    modelloVenditeRicevutaFiscaleId?: number | null;
    /**
     * `ModelloContabile` predefinito per le fatture professionisti emesse.
     * @type {number}
     * @memberof Preferenze
     */
    modelloVenditeFatturaProfessionistaId?: number | null;
    /**
     * `ModelloContabile` predefinito per le fatture differite emesse.
     * @type {number}
     * @memberof Preferenze
     */
    modelloVenditeFatturaDifferitaId?: number | null;
    /**
     * `ModelloContabile` predefinito per le fatture di acconto emesse.
     * @type {number}
     * @memberof Preferenze
     */
    modelloVenditeFatturaAccontoId?: number | null;
    /**
     * `ModelloContabile` predefinito per le fatture accompagnatorie fornitori emesse.
     * @type {number}
     * @memberof Preferenze
     */
    modelloAcquistiFatturaAccompagnatoriaId?: number | null;
    /**
     * `ModelloContabile` predefinito per le fatture accompagnatorie emesse.
     * @type {number}
     * @memberof Preferenze
     */
    modelloVenditeFatturaAccompagnaoriaId?: number | null;
    /**
     * `ModelloContabile` predefinito per le note di debito fornitori emesse.
     * @type {number}
     * @memberof Preferenze
     */
    modelloAcquistiNotaDebitoId?: number | null;
    /**
     * `ModelloContabile` predefinito per le note di credito emesse.
     * @type {number}
     * @memberof Preferenze
     */
    modelloAcquistiNotaCreditoId?: number | null;
    /**
     * `ModelloContabile` predefinito per le fatture professionisti fornitori emesse.
     * @type {number}
     * @memberof Preferenze
     */
    modelloAcquistiFatturaProfessionistiId?: number | null;
    /**
     * `ModelloContabile` predefinito per le fatture differite fornitori emesse.
     * @type {number}
     * @memberof Preferenze
     */
    modelloAcquistiFatturaDifferitaId?: number | null;
    /**
     * `ModelloContabile` predefinito per le fatture di acconto fornitori emesse.
     * @type {number}
     * @memberof Preferenze
     */
    modelloAcquistiFatturaAccontoId?: number | null;
    /**
     * 
     * @type {SedeLegale}
     * @memberof Preferenze
     */
    sedeLegale?: SedeLegale;
    /**
     * 
     * @type {SedeOperativa}
     * @memberof Preferenze
     */
    sedeOperativa?: SedeOperativa;
    /**
     * 
     * @type {SedeAltra}
     * @memberof Preferenze
     */
    sedeAltra?: SedeAltra;
}


/**
 * @export
 */
export const PreferenzeTipoBilancioEnum = {
    Analitico: 'Analitico',
    Sintentico: 'Sintentico'
} as const;
export type PreferenzeTipoBilancioEnum = typeof PreferenzeTipoBilancioEnum[keyof typeof PreferenzeTipoBilancioEnum];

/**
 * @export
 */
export const PreferenzePeriodoIvaEnum = {
    Mensile: 'Mensile',
    Trimestrale: 'Trimestrale'
} as const;
export type PreferenzePeriodoIvaEnum = typeof PreferenzePeriodoIvaEnum[keyof typeof PreferenzePeriodoIvaEnum];

/**
 * @export
 */
export const PreferenzeLiquidazioneIvaEnum = {
    Competenza: 'Competenza',
    Cassa: 'Cassa'
} as const;
export type PreferenzeLiquidazioneIvaEnum = typeof PreferenzeLiquidazioneIvaEnum[keyof typeof PreferenzeLiquidazioneIvaEnum];


/**
 * Check if a given object implements the Preferenze interface.
 */
export function instanceOfPreferenze(value: object): value is Preferenze {
    return true;
}

export function PreferenzeFromJSON(json: any): Preferenze {
    return PreferenzeFromJSONTyped(json, false);
}

export function PreferenzeFromJSONTyped(json: any, ignoreDiscriminator: boolean): Preferenze {
    if (json == null) {
        return json;
    }
    return {
        
        'id': json['id'] == null ? undefined : json['id'],
        'concurrencyToken': json['concurrencyToken'] == null ? undefined : json['concurrencyToken'],
        'ragioneSociale1': json['ragioneSociale1'] == null ? undefined : json['ragioneSociale1'],
        'ragioneSociale2': json['ragioneSociale2'] == null ? undefined : json['ragioneSociale2'],
        'partitaIva': json['partitaIva'] == null ? undefined : json['partitaIva'],
        'registroImprese': json['registroImprese'] == null ? undefined : json['registroImprese'],
        'codiceFiscale': json['codiceFiscale'] == null ? undefined : json['codiceFiscale'],
        'codiceSia': json['codiceSia'] == null ? undefined : json['codiceSia'],
        'codiceRea': json['codiceRea'] == null ? undefined : json['codiceRea'],
        'personaGiuridica': json['personaGiuridica'] == null ? undefined : json['personaGiuridica'],
        'dataNascita': json['dataNascita'] == null ? undefined : (new Date(json['dataNascita'])),
        'localitaNascita': json['localitaNascita'] == null ? undefined : json['localitaNascita'],
        'provinciaNascita': json['provinciaNascita'] == null ? undefined : json['provinciaNascita'],
        'sesso': json['sesso'] == null ? undefined : json['sesso'],
        'attivita': json['attivita'] == null ? undefined : json['attivita'],
        'ivaEsclusa': json['ivaEsclusa'] == null ? undefined : json['ivaEsclusa'],
        'decimaliPrezzoUnitario': json['decimaliPrezzoUnitario'] == null ? undefined : json['decimaliPrezzoUnitario'],
        'causaleProduzioneComponentiId': json['causaleProduzioneComponentiId'] == null ? undefined : json['causaleProduzioneComponentiId'],
        'causaleProduzioneCompostiId': json['causaleProduzioneCompostiId'] == null ? undefined : json['causaleProduzioneCompostiId'],
        'causaleMagazzinoVenditaId': json['causaleMagazzinoVenditaId'] == null ? undefined : json['causaleMagazzinoVenditaId'],
        'causaleMagazzinoAcquistoId': json['causaleMagazzinoAcquistoId'] == null ? undefined : json['causaleMagazzinoAcquistoId'],
        'ricercaArticolo': json['ricercaArticolo'] == null ? undefined : RicercaArticoloFromJSON(json['ricercaArticolo']),
        'dataSpeciale1': json['dataSpeciale1'] == null ? undefined : json['dataSpeciale1'],
        'dataSpeciale2': json['dataSpeciale2'] == null ? undefined : json['dataSpeciale2'],
        'giorniExtraDataSpeciale1': json['giorniExtraDataSpeciale1'] == null ? undefined : json['giorniExtraDataSpeciale1'],
        'giorniExtraDataSpeciale2': json['giorniExtraDataSpeciale2'] == null ? undefined : json['giorniExtraDataSpeciale2'],
        'pagatoManuale': json['pagatoManuale'] == null ? undefined : json['pagatoManuale'],
        'causaleMagazzinoMerciId': json['causaleMagazzinoMerciId'] == null ? undefined : json['causaleMagazzinoMerciId'],
        'magazzinoMerciId': json['magazzinoMerciId'] == null ? undefined : json['magazzinoMerciId'],
        'listinoMerciId': json['listinoMerciId'] == null ? undefined : json['listinoMerciId'],
        'modalitaPagamentoMerciId': json['modalitaPagamentoMerciId'] == null ? undefined : json['modalitaPagamentoMerciId'],
        'documentiCausaleIvaId': json['documentiCausaleIvaId'] == null ? undefined : json['documentiCausaleIvaId'],
        'documentiMagazzinoId': json['documentiMagazzinoId'] == null ? undefined : json['documentiMagazzinoId'],
        'documentiListinoId': json['documentiListinoId'] == null ? undefined : json['documentiListinoId'],
        'eMail': json['eMail'] == null ? undefined : json['eMail'],
        'sitoWeb': json['sitoWeb'] == null ? undefined : json['sitoWeb'],
        'annoContabile': json['annoContabile'] == null ? undefined : json['annoContabile'],
        'unitDiMisura': json['unitàDiMisura'] == null ? undefined : json['unitàDiMisura'],
        'causalePagamentoModelloCU': json['causalePagamentoModelloCU'] == null ? undefined : json['causalePagamentoModelloCU'],
        'impostazioniSdi': json['impostazioniSdi'] == null ? undefined : ImpostazioniSdiFromJSON(json['impostazioniSdi']),
        'tipoBilancio': json['tipoBilancio'] == null ? undefined : json['tipoBilancio'],
        'periodoIva': json['periodoIva'] == null ? undefined : json['periodoIva'],
        'liquidazioneIva': json['liquidazioneIva'] == null ? undefined : json['liquidazioneIva'],
        'modificaRegistrazioneContabileAllaEmissione': json['modificaRegistrazioneContabileAllaEmissione'] == null ? undefined : json['modificaRegistrazioneContabileAllaEmissione'],
        'ottimizzaEmissioneOrdini': json['ottimizzaEmissioneOrdini'] == null ? undefined : json['ottimizzaEmissioneOrdini'],
        'aggiungiAnnoInCorsoAlNumeroDocumento': json['aggiungiAnnoInCorsoAlNumeroDocumento'] == null ? undefined : json['aggiungiAnnoInCorsoAlNumeroDocumento'],
        'consentiCambioManualeStatoDdt': json['consentiCambioManualeStatoDdt'] == null ? undefined : json['consentiCambioManualeStatoDdt'],
        'emailBody': json['emailBody'] == null ? undefined : json['emailBody'],
        'emailAutoSend': json['emailAutoSend'] == null ? undefined : json['emailAutoSend'],
        'autoProduzione': json['autoProduzione'] == null ? undefined : json['autoProduzione'],
        'codiceDestinatario': json['codiceDestinatario'] == null ? undefined : json['codiceDestinatario'],
        'pec': json['pec'] == null ? undefined : json['pec'],
        'modelloVenditeNotaDebitoId': json['modelloVenditeNotaDebitoId'] == null ? undefined : json['modelloVenditeNotaDebitoId'],
        'modelloVenditeNotaCreditoId': json['modelloVenditeNotaCreditoId'] == null ? undefined : json['modelloVenditeNotaCreditoId'],
        'modelloVenditeRicevutaFiscaleId': json['modelloVenditeRicevutaFiscaleId'] == null ? undefined : json['modelloVenditeRicevutaFiscaleId'],
        'modelloVenditeFatturaProfessionistaId': json['modelloVenditeFatturaProfessionistaId'] == null ? undefined : json['modelloVenditeFatturaProfessionistaId'],
        'modelloVenditeFatturaDifferitaId': json['modelloVenditeFatturaDifferitaId'] == null ? undefined : json['modelloVenditeFatturaDifferitaId'],
        'modelloVenditeFatturaAccontoId': json['modelloVenditeFatturaAccontoId'] == null ? undefined : json['modelloVenditeFatturaAccontoId'],
        'modelloAcquistiFatturaAccompagnatoriaId': json['modelloAcquistiFatturaAccompagnatoriaId'] == null ? undefined : json['modelloAcquistiFatturaAccompagnatoriaId'],
        'modelloVenditeFatturaAccompagnaoriaId': json['modelloVenditeFatturaAccompagnaoriaId'] == null ? undefined : json['modelloVenditeFatturaAccompagnaoriaId'],
        'modelloAcquistiNotaDebitoId': json['modelloAcquistiNotaDebitoId'] == null ? undefined : json['modelloAcquistiNotaDebitoId'],
        'modelloAcquistiNotaCreditoId': json['modelloAcquistiNotaCreditoId'] == null ? undefined : json['modelloAcquistiNotaCreditoId'],
        'modelloAcquistiFatturaProfessionistiId': json['modelloAcquistiFatturaProfessionistiId'] == null ? undefined : json['modelloAcquistiFatturaProfessionistiId'],
        'modelloAcquistiFatturaDifferitaId': json['modelloAcquistiFatturaDifferitaId'] == null ? undefined : json['modelloAcquistiFatturaDifferitaId'],
        'modelloAcquistiFatturaAccontoId': json['modelloAcquistiFatturaAccontoId'] == null ? undefined : json['modelloAcquistiFatturaAccontoId'],
        'sedeLegale': json['sedeLegale'] == null ? undefined : SedeLegaleFromJSON(json['sedeLegale']),
        'sedeOperativa': json['sedeOperativa'] == null ? undefined : SedeOperativaFromJSON(json['sedeOperativa']),
        'sedeAltra': json['sedeAltra'] == null ? undefined : SedeAltraFromJSON(json['sedeAltra']),
    };
}

export function PreferenzeToJSON(json: any): Preferenze {
    return PreferenzeToJSONTyped(json, false);
}

export function PreferenzeToJSONTyped(value?: Preferenze | null, ignoreDiscriminator: boolean = false): any {
    if (value == null) {
        return value;
    }

    return {
        
        'id': value['id'],
        'concurrencyToken': value['concurrencyToken'],
        'ragioneSociale1': value['ragioneSociale1'],
        'ragioneSociale2': value['ragioneSociale2'],
        'partitaIva': value['partitaIva'],
        'registroImprese': value['registroImprese'],
        'codiceFiscale': value['codiceFiscale'],
        'codiceSia': value['codiceSia'],
        'codiceRea': value['codiceRea'],
        'personaGiuridica': value['personaGiuridica'],
        'dataNascita': value['dataNascita'] == null ? undefined : ((value['dataNascita'] as any).toISOString()),
        'localitaNascita': value['localitaNascita'],
        'provinciaNascita': value['provinciaNascita'],
        'sesso': value['sesso'],
        'attivita': value['attivita'],
        'ivaEsclusa': value['ivaEsclusa'],
        'decimaliPrezzoUnitario': value['decimaliPrezzoUnitario'],
        'causaleProduzioneComponentiId': value['causaleProduzioneComponentiId'],
        'causaleProduzioneCompostiId': value['causaleProduzioneCompostiId'],
        'causaleMagazzinoVenditaId': value['causaleMagazzinoVenditaId'],
        'causaleMagazzinoAcquistoId': value['causaleMagazzinoAcquistoId'],
        'ricercaArticolo': RicercaArticoloToJSON(value['ricercaArticolo']),
        'dataSpeciale1': value['dataSpeciale1'],
        'dataSpeciale2': value['dataSpeciale2'],
        'giorniExtraDataSpeciale1': value['giorniExtraDataSpeciale1'],
        'giorniExtraDataSpeciale2': value['giorniExtraDataSpeciale2'],
        'pagatoManuale': value['pagatoManuale'],
        'causaleMagazzinoMerciId': value['causaleMagazzinoMerciId'],
        'magazzinoMerciId': value['magazzinoMerciId'],
        'listinoMerciId': value['listinoMerciId'],
        'modalitaPagamentoMerciId': value['modalitaPagamentoMerciId'],
        'documentiCausaleIvaId': value['documentiCausaleIvaId'],
        'documentiMagazzinoId': value['documentiMagazzinoId'],
        'documentiListinoId': value['documentiListinoId'],
        'eMail': value['eMail'],
        'sitoWeb': value['sitoWeb'],
        'annoContabile': value['annoContabile'],
        'unitàDiMisura': value['unitDiMisura'],
        'causalePagamentoModelloCU': value['causalePagamentoModelloCU'],
        'impostazioniSdi': ImpostazioniSdiToJSON(value['impostazioniSdi']),
        'tipoBilancio': value['tipoBilancio'],
        'periodoIva': value['periodoIva'],
        'liquidazioneIva': value['liquidazioneIva'],
        'modificaRegistrazioneContabileAllaEmissione': value['modificaRegistrazioneContabileAllaEmissione'],
        'ottimizzaEmissioneOrdini': value['ottimizzaEmissioneOrdini'],
        'aggiungiAnnoInCorsoAlNumeroDocumento': value['aggiungiAnnoInCorsoAlNumeroDocumento'],
        'consentiCambioManualeStatoDdt': value['consentiCambioManualeStatoDdt'],
        'emailBody': value['emailBody'],
        'emailAutoSend': value['emailAutoSend'],
        'autoProduzione': value['autoProduzione'],
        'codiceDestinatario': value['codiceDestinatario'],
        'pec': value['pec'],
        'modelloVenditeNotaDebitoId': value['modelloVenditeNotaDebitoId'],
        'modelloVenditeNotaCreditoId': value['modelloVenditeNotaCreditoId'],
        'modelloVenditeRicevutaFiscaleId': value['modelloVenditeRicevutaFiscaleId'],
        'modelloVenditeFatturaProfessionistaId': value['modelloVenditeFatturaProfessionistaId'],
        'modelloVenditeFatturaDifferitaId': value['modelloVenditeFatturaDifferitaId'],
        'modelloVenditeFatturaAccontoId': value['modelloVenditeFatturaAccontoId'],
        'modelloAcquistiFatturaAccompagnatoriaId': value['modelloAcquistiFatturaAccompagnatoriaId'],
        'modelloVenditeFatturaAccompagnaoriaId': value['modelloVenditeFatturaAccompagnaoriaId'],
        'modelloAcquistiNotaDebitoId': value['modelloAcquistiNotaDebitoId'],
        'modelloAcquistiNotaCreditoId': value['modelloAcquistiNotaCreditoId'],
        'modelloAcquistiFatturaProfessionistiId': value['modelloAcquistiFatturaProfessionistiId'],
        'modelloAcquistiFatturaDifferitaId': value['modelloAcquistiFatturaDifferitaId'],
        'modelloAcquistiFatturaAccontoId': value['modelloAcquistiFatturaAccontoId'],
        'sedeLegale': SedeLegaleToJSON(value['sedeLegale']),
        'sedeOperativa': SedeOperativaToJSON(value['sedeOperativa']),
        'sedeAltra': SedeAltraToJSON(value['sedeAltra']),
    };
}

