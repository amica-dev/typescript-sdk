/* tslint:disable */
/* eslint-disable */
/**
 * Amica Cloud API
 * L\'Amica Cloud API fornisce accesso programmatico a tutti i dati aziendali gestiti da [Amica 20](https://gestionaleamica.com). Supporta il ciclo completo di documenti, fatture, magazzino, contabilità e anagrafiche. Per guide e documentazione completa, visitare [amica.dev](https://amica.dev/).  ## Autenticazione  Tutte le richieste API richiedono un token OAuth 2.0 Bearer valido, da includere nell\'header `Authorization`:  ``` Authorization: Bearer <token> ```  ### Registra la tua app  Per integrare l\'Amica Cloud API registra la tua applicazione sull\'[**App Store di Amica**](https://apps.amica20.it). Al termine della registrazione ottieni una coppia di credenziali OAuth 2.0 — `client_id` e `client_secret` (il secret è mostrato **una sola volta**) — e scegli gli **scope** e il **flusso di autenticazione** desiderati.  ### Scegli il flusso  La scelta dipende da **come** la tua applicazione si autentica:  - C\'è un **utente** che può accedere via browser (web app, SPA, app mobile)? → **Authorization Code con PKCE**. - È un **servizio headless** (backend, batch, integrazione server-to-server) di una **singola azienda**, senza un utente che effettua il login? → **Client Credentials**.  #### Authorization Code con PKCE  Consigliato per le app che operano per conto di un utente Amica ed è l\'**unico flusso disponibile per le app pubblicate sul marketplace**. Una sola registrazione serve un numero qualsiasi di aziende: ogni utente autorizza la tua app per la propria azienda tramite la pagina di consenso dell\'identity provider, e il token riceve automaticamente il contesto di quell\'azienda. La tua app riceve un `code` da scambiare con un access token.  ``` GET  {identity-provider}/connect/authorize?response_type=code&client_id=<client_id>&redirect_uri=<redirect_uri>&scope=openid%20read%20write%20documenti&code_challenge=<challenge>&code_challenge_method=S256 POST {identity-provider}/connect/token      grant_type=authorization_code&code=<code>&code_verifier=<verifier>&client_id=<client_id>&client_secret=<client_secret>&redirect_uri=<redirect_uri> ```  #### Client Credentials  Per integrazioni **server-to-server** senza utente interattivo. Disponibile solo per le **app private**, non per quelle pubblicate sul marketplace. Un\'app Client Credentials è **legata a una singola azienda** — quella dell\'utente che la registra — e il token ne riceve automaticamente il contesto. Per servire un\'azienda diversa serve una registrazione separata; se devi distribuire la stessa app a più aziende usa invece **Authorization Code**.  ``` POST {identity-provider}/connect/token Content-Type: application/x-www-form-urlencoded  grant_type=client_credentials&client_id=<client_id>&client_secret=<client_secret>&scope=comune read write documenti ```  > **Importante:** non includere lo scope `openid` (né `profile`/`email`) in questo flusso. `openid` attiva OpenID Connect — richiede un utente che effettua il login e l\'emissione di un ID token — cosa che un flusso server-to-server non prevede: la richiesta viene rifiutata con l\'errore `Client cannot request OpenID scopes in client credentials flow`. Indica solo gli scope di risorsa (`comune`, `magazzino`, `documenti`, `contabilita`, ed eventualmente `read`/`write`).  In entrambi i casi la risposta contiene l\'`access_token` (JWT con `aud: amica-cloud`) da usare nelle chiamate successive finché non scade (`expires_in`), dopodiché va richiesto un nuovo token. Ogni token contiene uno o più **scope** che determinano le aree accessibili (vedi sotto). Dalla [API Reference](https://amica.dev) è possibile incollare un access token per provare gli endpoint direttamente dal browser.  ## Scope di autorizzazione  L\'accesso agli endpoint è governato dagli scope presenti nel token OAuth:  | Scope | Descrizione | |-|-| | `comune` | Anagrafiche: contatti, indirizzi, nazioni, valute, modalità di pagamento, ecc. | | `magazzino` | Magazzino: articoli, listini, movimenti di magazzino, giacenze, distinte base. | | `contabilita` | Contabilità: registrazioni contabili, scadenze, castelletti IVA, fatture elettroniche XML. | | `documenti` | Documenti: fatture, note di credito, DDT, ordini, preventivi, proforma ed emissione. |  Una richiesta verso un endpoint non coperto dallo scope del token riceverà una risposta `403 Forbidden`.  ## Company ID  La maggior parte degli endpoint è relativa a una specifica azienda e segue il pattern:  ``` /api/v3/{companyId}/risorsa ```  Il `companyId` è l\'identificativo univoco di ciascun database aziendale. Usare l\'endpoint `GET /api/v3/config/Azienda` per ottenere l\'elenco delle aziende disponibili.  ## Paginazione  Gli endpoint che restituiscono liste supportano la paginazione tramite query parameter:  | Parametro | Descrizione | |-|-| | `Skip` | Numero di elementi da saltare dall\'inizio del set di risultati. | | `Take` | Numero di elementi da includere nella risposta. |  La risposta include due header:  | Header | Descrizione | |-|-| | `X-Read-TotalCount` | Numero totale di elementi che soddisfano il filtro corrente. | | `X-Read-Count` | Numero di elementi effettivamente restituiti nel body della risposta. |  ## Ordinamento e filtri  Gli endpoint lista accettano parametri aggiuntivi:  | Parametro | Descrizione | |-|-| | `Order` | Lista di proprietà per l\'ordinamento, separate da virgola. Un segno meno (`-`) prima del nome indica ordine discendente. Es. `-RagioneSociale1,Citta`. | | `Filter` | Condizioni di ricerca: lista di espressioni separate da virgola, ciascuna formata da nome campo, operatore, valore ed eventuale connettore logico. Operatori: `$eq`, `$ne`, `$gt`, `$lt`, `$lte`, `$gte`, `$ct` (contiene), `$nct`, `$sw` (inizia con), `$ew` (finisce con). Connettori: `$and` (default, omissibile) e `$or`; le sotto-query si racchiudono tra `[]`. Es. `RagioneSociale1 $ct acme $or, Fido $gt 1000`. | | `SkipTotalCount` | Se `true`, l\'header `X-Read-TotalCount` viene omesso dalla risposta: migliori prestazioni a scapito del conteggio totale. Default `false`. |  ## Espansione oggetti correlati  Gli endpoint singoli e lista supportano il parametro `Expand`. Quando fornito, gli oggetti correlati vengono inclusi inline nella risposta anziché restituiti come riferimenti. È possibile specificare espansioni multiple separate da virgola.  ## Gestione errori  L\'API usa codici di stato HTTP standard e restituisce [RFC 7807](https://tools.ietf.org/html/rfc7807) Problem Details in caso di errore:  | Codice | Significato | |-|-| | `400` | Bad Request — validazione fallita o parametro obbligatorio mancante. | | `401` | Unauthorized — token mancante o scaduto. | | `403` | Forbidden — accesso negato (vedi sotto le possibili cause). | | `404` | Not Found — la risorsa richiesta non esiste. | | `409` | Conflict — conflitto di concorrenza. | | `422` | Unprocessable Entity — entità non processabile (es. token di concorrenza obsoleto). |  Un `403` può avere tre cause; nelle ultime due il campo `code` della risposta indica quale:  - il token non possiede lo scope richiesto dall\'endpoint; - `code: cloud_not_active` — l\'account lavora con una connessione locale e la Cloud API non espone i suoi dati. Per attivare il servizio cloud contatta l\'assistenza, poi richiedi un nuovo token: lo stato del servizio è letto al rilascio del token; - `code: company_license_not_active` — la licenza dell\'azienda indicata nel percorso è scaduta o non è attiva. Le altre aziende con licenza attiva restano accessibili.  Il motivo dell\'errore è sempre nel campo `detail`. Ogni risposta di errore riporta inoltre `overridable`: quando vale `true`, l\'errore di validazione è *forzabile* e basta ripetere la stessa richiesta aggiungendo `validationOverride=true` alla query string perché il servizio la accetti. È il caso delle anomalie formali su dati reali — la partita IVA di un fornitore estero, per esempio — che il cliente ha comunque bisogno di registrare.  ## Controllo della concorrenza  Le entità contengono una proprietà `ConcurrencyToken`. Quando si aggiorna un\'entità tramite `PUT`, il token nel body della richiesta viene confrontato con il valore memorizzato. Se differiscono, viene restituito un `422 Unprocessable Entity`. Usare sempre l\'ultimo token ricevuto da una risposta `GET` o `POST`. 
 *
 * The version of the OpenAPI document: 3.3.2
 * Contact: assistenza@gestionaleamica.com
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */

import { mapValues } from '../runtime';
import type { Nazione } from './Nazione';
import {
    NazioneFromJSON,
    NazioneFromJSONTyped,
    NazioneToJSON,
    NazioneToJSONTyped,
} from './Nazione';
import type { SchedaCliente } from './SchedaCliente';
import {
    SchedaClienteFromJSON,
    SchedaClienteFromJSONTyped,
    SchedaClienteToJSON,
    SchedaClienteToJSONTyped,
} from './SchedaCliente';
import type { Banca } from './Banca';
import {
    BancaFromJSON,
    BancaFromJSONTyped,
    BancaToJSON,
    BancaToJSONTyped,
} from './Banca';
import type { AnagraficaNominativo2 } from './AnagraficaNominativo2';
import {
    AnagraficaNominativo2FromJSON,
    AnagraficaNominativo2FromJSONTyped,
    AnagraficaNominativo2ToJSON,
    AnagraficaNominativo2ToJSONTyped,
} from './AnagraficaNominativo2';
import type { Indirizzo } from './Indirizzo';
import {
    IndirizzoFromJSON,
    IndirizzoFromJSONTyped,
    IndirizzoToJSON,
    IndirizzoToJSONTyped,
} from './Indirizzo';
import type { AnagraficaNominativo1 } from './AnagraficaNominativo1';
import {
    AnagraficaNominativo1FromJSON,
    AnagraficaNominativo1FromJSONTyped,
    AnagraficaNominativo1ToJSON,
    AnagraficaNominativo1ToJSONTyped,
} from './AnagraficaNominativo1';
import type { AnagraficaSedeLegale } from './AnagraficaSedeLegale';
import {
    AnagraficaSedeLegaleFromJSON,
    AnagraficaSedeLegaleFromJSONTyped,
    AnagraficaSedeLegaleToJSON,
    AnagraficaSedeLegaleToJSONTyped,
} from './AnagraficaSedeLegale';
import type { AreaGeografica } from './AreaGeografica';
import {
    AreaGeograficaFromJSON,
    AreaGeograficaFromJSONTyped,
    AreaGeograficaToJSON,
    AreaGeograficaToJSONTyped,
} from './AreaGeografica';
import type { Valuta } from './Valuta';
import {
    ValutaFromJSON,
    ValutaFromJSONTyped,
    ValutaToJSON,
    ValutaToJSONTyped,
} from './Valuta';
import type { SchedaFornitore } from './SchedaFornitore';
import {
    SchedaFornitoreFromJSON,
    SchedaFornitoreFromJSONTyped,
    SchedaFornitoreToJSON,
    SchedaFornitoreToJSONTyped,
} from './SchedaFornitore';

/**
 * Anagrafica di cliente, fornitore, agente o vettore.
 * @export
 * @interface Anagrafica
 */
export interface Anagrafica {
    /**
     * Identificativo univoco.
     * @type {number}
     * @memberof Anagrafica
     */
    id?: number;
    /**
     * Il token di concorrenza implementa il controllo di concorrenza ottimistica: a ogni operazione di aggiornamento o cancellazione il valore del token sul database viene confrontato con quello sull'entità. Se i valori coincidono, l'operazione viene eseguita; se differiscono, si assume che un altro utente abbia effettuato una scrittura nel frattempo e l'aggiornamento viene rifiutato.
     * @type {number}
     * @memberof Anagrafica
     */
    concurrencyToken?: number;
    /**
     * Identificativo univoco di `Modello`. Sempre null. Questa proprietà è usata solo dal client desktop Amica 20 per Windows ed è da considerarsi obsoleta.
     * @type {number}
     * @memberof Anagrafica
     */
    modelloId?: number | null;
    /**
     * Identificativo univoco di `Nazione` (nazione).
     * @type {number}
     * @memberof Anagrafica
     */
    nazioneId?: number | null;
    /**
     * 
     * @type {Nazione}
     * @memberof Anagrafica
     */
    nazione?: Nazione;
    /**
     * Identificativo univoco di `AreaGeografica` (area geografica).
     * @type {number}
     * @memberof Anagrafica
     */
    areaGeograficaId?: number | null;
    /**
     * 
     * @type {AreaGeografica}
     * @memberof Anagrafica
     */
    areaGeografica?: AreaGeografica;
    /**
     * Identificativo univoco di `Valuta` (valuta).
     * @type {number}
     * @memberof Anagrafica
     */
    valutaId?: number | null;
    /**
     * 
     * @type {Valuta}
     * @memberof Anagrafica
     */
    valuta?: Valuta;
    /**
     * Identificativo univoco dell'`Indirizzo` (indirizzo) predefinito.
     * @type {number}
     * @memberof Anagrafica
     */
    indirizzoPredefinitoId?: number | null;
    /**
     * Elenco degli `Indirizzo` dell'anagrafica.
     * @type {Array<Indirizzo>}
     * @memberof Anagrafica
     */
    indirizzi?: Array<Indirizzo> | null;
    /**
     * 
     * @type {SchedaCliente}
     * @memberof Anagrafica
     */
    schedaCliente?: SchedaCliente;
    /**
     * 
     * @type {SchedaFornitore}
     * @memberof Anagrafica
     */
    schedaFornitore?: SchedaFornitore;
    /**
     * Indica se l'anagrafica è attiva o meno.
     * @type {boolean}
     * @memberof Anagrafica
     */
    stato?: boolean;
    /**
     * Indica se l'anagrafica è un cliente.
     * @type {boolean}
     * @memberof Anagrafica
     */
    cliente?: boolean;
    /**
     * Indica se l'anagrafica è un fornitore.
     * @type {boolean}
     * @memberof Anagrafica
     */
    fornitore?: boolean;
    /**
     * Indica se l'anagrafica opera come agente di vendita per conto dell'azienda.
     * @type {boolean}
     * @memberof Anagrafica
     */
    agente?: boolean;
    /**
     * Indica se l'anagrafica opera come vettore.
     * @type {boolean}
     * @memberof Anagrafica
     */
    vettore?: boolean;
    /**
     * Indica se l'anagrafica opera come capo area.
     * @type {boolean}
     * @memberof Anagrafica
     */
    capoArea?: boolean;
    /**
     * Indica se l'anagrafica è una persona giuridica o meno. `true` indica una persona giuridica, `false` una persona fisica.
     * @type {boolean}
     * @memberof Anagrafica
     */
    personaGiuridica?: boolean;
    /**
     * 
     * @type {Banca}
     * @memberof Anagrafica
     */
    banca?: Banca;
    /**
     * 
     * @type {AnagraficaNominativo1}
     * @memberof Anagrafica
     */
    nominativo1?: AnagraficaNominativo1;
    /**
     * 
     * @type {AnagraficaNominativo2}
     * @memberof Anagrafica
     */
    nominativo2?: AnagraficaNominativo2;
    /**
     * 
     * @type {AnagraficaSedeLegale}
     * @memberof Anagrafica
     */
    sedeLegale?: AnagraficaSedeLegale;
    /**
     * Codice assegnato all'anagrafica.
     * @type {string}
     * @memberof Anagrafica
     */
    codice?: string | null;
    /**
     * Data di primo inserimento.
     * @type {Date}
     * @memberof Anagrafica
     */
    dataInserimento?: Date | null;
    /**
     * Ragione sociale, oppure nome e cognome della persona fisica.
     * @type {string}
     * @memberof Anagrafica
     */
    ragioneSociale1: string;
    /**
     * Eventuale seconda riga della ragione sociale. Usata principalmente nelle stampe, quando si vuole suddividere la ragione sociale su due righe.
     * @type {string}
     * @memberof Anagrafica
     */
    ragioneSociale2?: string | null;
    /**
     * Indirizzo email.
     * @type {string}
     * @memberof Anagrafica
     */
    eMail?: string | null;
    /**
     * Indirizzo web.
     * @type {string}
     * @memberof Anagrafica
     */
    sitoWeb?: string | null;
    /**
     * Partita IVA. La correttezza formale è verificata dal servizio al salvataggio: l'errore che ne deriva è
     * forzabile con `validationOverride`.
     * @type {string}
     * @memberof Anagrafica
     */
    partitaIva?: string | null;
    /**
     * Codice fiscale. Solitamente diverso dalla `PartitaIva`. Come per la partita IVA, la correttezza
     * formale è verificata dal servizio al salvataggio e l'errore è forzabile con `validationOverride`.
     * @type {string}
     * @memberof Anagrafica
     */
    codiceFiscale?: string | null;
    /**
     * Note.
     * @type {string}
     * @memberof Anagrafica
     */
    note?: string | null;
    /**
     * Note rilevanti. I client ufficiali Amica le evidenziano alla creazione di un nuovo documento fiscale.
     * @type {string}
     * @memberof Anagrafica
     */
    noteImportanti?: string | null;
    /**
     * Indirizzo Pec (posta elettronica certificata).
     * @type {string}
     * @memberof Anagrafica
     */
    pec?: string | null;
    /**
     * Codice destinatario per il sistema fiscale italiano. Usato per il recapito delle fatture elettroniche italiane.
     * @type {string}
     * @memberof Anagrafica
     */
    codiceDestinatario?: string | null;
    /**
     * Numero di protocollo della dichiarazione d'intento.
     * @type {string}
     * @memberof Anagrafica
     */
    dichiarazioneIntento?: string | null;
    /**
     * Solitamente necessario quando si ha a che fare con enti della Pubblica Amministrazione italiana. Identifica univocamente l'ufficio di destinazione all'interno della PA.
     * @type {string}
     * @memberof Anagrafica
     */
    riferimentoAmministrazione?: string | null;
}

/**
 * Check if a given object implements the Anagrafica interface.
 */
export function instanceOfAnagrafica(value: object): value is Anagrafica {
    if (!('ragioneSociale1' in value) || value['ragioneSociale1'] === undefined) return false;
    return true;
}

export function AnagraficaFromJSON(json: any): Anagrafica {
    return AnagraficaFromJSONTyped(json, false);
}

export function AnagraficaFromJSONTyped(json: any, ignoreDiscriminator: boolean): Anagrafica {
    if (json == null) {
        return json;
    }
    return {
        
        'id': json['id'] == null ? undefined : json['id'],
        'concurrencyToken': json['concurrencyToken'] == null ? undefined : json['concurrencyToken'],
        'modelloId': json['modelloId'] == null ? undefined : json['modelloId'],
        'nazioneId': json['nazioneId'] == null ? undefined : json['nazioneId'],
        'nazione': json['nazione'] == null ? undefined : NazioneFromJSON(json['nazione']),
        'areaGeograficaId': json['areaGeograficaId'] == null ? undefined : json['areaGeograficaId'],
        'areaGeografica': json['areaGeografica'] == null ? undefined : AreaGeograficaFromJSON(json['areaGeografica']),
        'valutaId': json['valutaId'] == null ? undefined : json['valutaId'],
        'valuta': json['valuta'] == null ? undefined : ValutaFromJSON(json['valuta']),
        'indirizzoPredefinitoId': json['indirizzoPredefinitoId'] == null ? undefined : json['indirizzoPredefinitoId'],
        'indirizzi': json['indirizzi'] == null ? undefined : ((json['indirizzi'] as Array<any>).map(IndirizzoFromJSON)),
        'schedaCliente': json['schedaCliente'] == null ? undefined : SchedaClienteFromJSON(json['schedaCliente']),
        'schedaFornitore': json['schedaFornitore'] == null ? undefined : SchedaFornitoreFromJSON(json['schedaFornitore']),
        'stato': json['stato'] == null ? undefined : json['stato'],
        'cliente': json['cliente'] == null ? undefined : json['cliente'],
        'fornitore': json['fornitore'] == null ? undefined : json['fornitore'],
        'agente': json['agente'] == null ? undefined : json['agente'],
        'vettore': json['vettore'] == null ? undefined : json['vettore'],
        'capoArea': json['capoArea'] == null ? undefined : json['capoArea'],
        'personaGiuridica': json['personaGiuridica'] == null ? undefined : json['personaGiuridica'],
        'banca': json['banca'] == null ? undefined : BancaFromJSON(json['banca']),
        'nominativo1': json['nominativo1'] == null ? undefined : AnagraficaNominativo1FromJSON(json['nominativo1']),
        'nominativo2': json['nominativo2'] == null ? undefined : AnagraficaNominativo2FromJSON(json['nominativo2']),
        'sedeLegale': json['sedeLegale'] == null ? undefined : AnagraficaSedeLegaleFromJSON(json['sedeLegale']),
        'codice': json['codice'] == null ? undefined : json['codice'],
        'dataInserimento': json['dataInserimento'] == null ? undefined : (new Date(json['dataInserimento'])),
        'ragioneSociale1': json['ragioneSociale1'],
        'ragioneSociale2': json['ragioneSociale2'] == null ? undefined : json['ragioneSociale2'],
        'eMail': json['eMail'] == null ? undefined : json['eMail'],
        'sitoWeb': json['sitoWeb'] == null ? undefined : json['sitoWeb'],
        'partitaIva': json['partitaIva'] == null ? undefined : json['partitaIva'],
        'codiceFiscale': json['codiceFiscale'] == null ? undefined : json['codiceFiscale'],
        'note': json['note'] == null ? undefined : json['note'],
        'noteImportanti': json['noteImportanti'] == null ? undefined : json['noteImportanti'],
        'pec': json['pec'] == null ? undefined : json['pec'],
        'codiceDestinatario': json['codiceDestinatario'] == null ? undefined : json['codiceDestinatario'],
        'dichiarazioneIntento': json['dichiarazioneIntento'] == null ? undefined : json['dichiarazioneIntento'],
        'riferimentoAmministrazione': json['riferimentoAmministrazione'] == null ? undefined : json['riferimentoAmministrazione'],
    };
}

export function AnagraficaToJSON(json: any): Anagrafica {
    return AnagraficaToJSONTyped(json, false);
}

export function AnagraficaToJSONTyped(value?: Anagrafica | null, ignoreDiscriminator: boolean = false): any {
    if (value == null) {
        return value;
    }

    return {
        
        'id': value['id'],
        'concurrencyToken': value['concurrencyToken'],
        'modelloId': value['modelloId'],
        'nazioneId': value['nazioneId'],
        'nazione': NazioneToJSON(value['nazione']),
        'areaGeograficaId': value['areaGeograficaId'],
        'areaGeografica': AreaGeograficaToJSON(value['areaGeografica']),
        'valutaId': value['valutaId'],
        'valuta': ValutaToJSON(value['valuta']),
        'indirizzoPredefinitoId': value['indirizzoPredefinitoId'],
        'indirizzi': value['indirizzi'] == null ? undefined : ((value['indirizzi'] as Array<any>).map(IndirizzoToJSON)),
        'schedaCliente': SchedaClienteToJSON(value['schedaCliente']),
        'schedaFornitore': SchedaFornitoreToJSON(value['schedaFornitore']),
        'stato': value['stato'],
        'cliente': value['cliente'],
        'fornitore': value['fornitore'],
        'agente': value['agente'],
        'vettore': value['vettore'],
        'capoArea': value['capoArea'],
        'personaGiuridica': value['personaGiuridica'],
        'banca': BancaToJSON(value['banca']),
        'nominativo1': AnagraficaNominativo1ToJSON(value['nominativo1']),
        'nominativo2': AnagraficaNominativo2ToJSON(value['nominativo2']),
        'sedeLegale': AnagraficaSedeLegaleToJSON(value['sedeLegale']),
        'codice': value['codice'],
        'dataInserimento': value['dataInserimento'] == null ? undefined : ((value['dataInserimento'] as any).toISOString()),
        'ragioneSociale1': value['ragioneSociale1'],
        'ragioneSociale2': value['ragioneSociale2'],
        'eMail': value['eMail'],
        'sitoWeb': value['sitoWeb'],
        'partitaIva': value['partitaIva'],
        'codiceFiscale': value['codiceFiscale'],
        'note': value['note'],
        'noteImportanti': value['noteImportanti'],
        'pec': value['pec'],
        'codiceDestinatario': value['codiceDestinatario'],
        'dichiarazioneIntento': value['dichiarazioneIntento'],
        'riferimentoAmministrazione': value['riferimentoAmministrazione'],
    };
}

