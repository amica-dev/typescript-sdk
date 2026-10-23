/* tslint:disable */
/* eslint-disable */
/**
 * Amica Cloud API
 * L\'Amica Cloud API fornisce accesso programmatico a tutti i dati aziendali gestiti da [Amica 20](https://gestionaleamica.com). Supporta il ciclo completo di documenti, fatture, magazzino, contabilità e anagrafiche. Per guide e documentazione completa, visitare [amica.dev](https://amica.dev/).  ## Autenticazione  Tutte le richieste API richiedono un token OAuth 2.0 Bearer valido, da includere nell\'header `Authorization`:  ``` Authorization: Bearer <token> ```  ### Registra la tua app  Per integrare l\'Amica Cloud API registra la tua applicazione sull\'[**App Store di Amica**](https://apps.amica20.it). Al termine della registrazione ottieni una coppia di credenziali OAuth 2.0 — `client_id` e `client_secret` (il secret è mostrato **una sola volta**) — e scegli gli **scope** e il **flusso di autenticazione** desiderati.  ### Scegli il flusso  La scelta dipende da **come** la tua applicazione si autentica:  - C\'è un **utente** che può accedere via browser (web app, SPA, app mobile)? → **Authorization Code con PKCE**. - È un **servizio headless** (backend, batch, integrazione server-to-server) di una **singola azienda**, senza un utente che effettua il login? → **Client Credentials**.  #### Authorization Code con PKCE  Consigliato per le app che operano per conto di un utente Amica ed è l\'**unico flusso disponibile per le app pubblicate sul marketplace**. Una sola registrazione serve un numero qualsiasi di aziende: ogni utente autorizza la tua app per la propria azienda tramite la pagina di consenso dell\'identity provider, e il token riceve automaticamente il contesto di quell\'azienda. La tua app riceve un `code` da scambiare con un access token.  ``` GET  {identity-provider}/connect/authorize?response_type=code&client_id=<client_id>&redirect_uri=<redirect_uri>&scope=openid%20read%20write%20documenti&code_challenge=<challenge>&code_challenge_method=S256 POST {identity-provider}/connect/token      grant_type=authorization_code&code=<code>&code_verifier=<verifier>&client_id=<client_id>&client_secret=<client_secret>&redirect_uri=<redirect_uri> ```  #### Client Credentials  Per integrazioni **server-to-server** senza utente interattivo. Disponibile solo per le **app private**, non per quelle pubblicate sul marketplace. Un\'app Client Credentials è **legata a una singola azienda** — quella dell\'utente che la registra — e il token ne riceve automaticamente il contesto. Per servire un\'azienda diversa serve una registrazione separata; se devi distribuire la stessa app a più aziende usa invece **Authorization Code**.  ``` POST {identity-provider}/connect/token Content-Type: application/x-www-form-urlencoded  grant_type=client_credentials&client_id=<client_id>&client_secret=<client_secret>&scope=comune read write documenti ```  > **Importante:** non includere lo scope `openid` (né `profile`/`email`) in questo flusso. `openid` attiva OpenID Connect — richiede un utente che effettua il login e l\'emissione di un ID token — cosa che un flusso server-to-server non prevede: la richiesta viene rifiutata con l\'errore `Client cannot request OpenID scopes in client credentials flow`. Indica solo gli scope di risorsa (`comune`, `magazzino`, `documenti`, `contabilita`, ed eventualmente `read`/`write`).  In entrambi i casi la risposta contiene l\'`access_token` (JWT con `aud: amica-cloud`) da usare nelle chiamate successive finché non scade (`expires_in`), dopodiché va richiesto un nuovo token. Ogni token contiene uno o più **scope** che determinano le aree accessibili (vedi sotto). Dalla [API Reference](https://amica.dev) è possibile incollare un access token per provare gli endpoint direttamente dal browser.  ## Scope di autorizzazione  L\'accesso agli endpoint è governato dagli scope presenti nel token OAuth:  | Scope | Descrizione | |-|-| | `comune` | Anagrafiche: contatti, indirizzi, nazioni, valute, modalità di pagamento, ecc. | | `magazzino` | Magazzino: articoli, listini, movimenti di magazzino, giacenze, distinte base. | | `contabilita` | Contabilità: registrazioni contabili, scadenze, castelletti IVA, fatture elettroniche XML. | | `documenti` | Documenti: fatture, note di credito, DDT, ordini, preventivi, proforma ed emissione. |  Una richiesta verso un endpoint non coperto dallo scope del token riceverà una risposta `403 Forbidden`.  ## Company ID  La maggior parte degli endpoint è relativa a una specifica azienda e segue il pattern:  ``` /api/v3/{companyId}/risorsa ```  Il `companyId` è l\'identificativo univoco di ciascun database aziendale. Usare l\'endpoint `GET /api/v3/config/Azienda` per ottenere l\'elenco delle aziende disponibili.  ## Paginazione  Gli endpoint che restituiscono liste supportano la paginazione tramite query parameter:  | Parametro | Descrizione | |-|-| | `Skip` | Numero di elementi da saltare dall\'inizio del set di risultati. | | `Take` | Numero di elementi da includere nella risposta. |  La risposta include due header:  | Header | Descrizione | |-|-| | `X-Read-TotalCount` | Numero totale di elementi che soddisfano il filtro corrente. | | `X-Read-Count` | Numero di elementi effettivamente restituiti nel body della risposta. |  ## Ordinamento e filtri  Gli endpoint lista accettano parametri aggiuntivi:  | Parametro | Descrizione | |-|-| | `Order` | Lista di proprietà per l\'ordinamento, separate da virgola. Un segno meno (`-`) prima del nome indica ordine discendente. Es. `-RagioneSociale1,Citta`. | | `Filter` | Condizioni di ricerca: lista di espressioni separate da virgola, ciascuna formata da nome campo, operatore, valore ed eventuale connettore logico. Operatori: `$eq`, `$ne`, `$gt`, `$lt`, `$lte`, `$gte`, `$ct` (contiene), `$nct`, `$sw` (inizia con), `$ew` (finisce con). Connettori: `$and` (default, omissibile) e `$or`; le sotto-query si racchiudono tra `[]`. Es. `RagioneSociale1 $ct acme $or, Fido $gt 1000`. | | `SkipTotalCount` | Se `true`, l\'header `X-Read-TotalCount` viene omesso dalla risposta: migliori prestazioni a scapito del conteggio totale. Default `false`. |  ## Espansione oggetti correlati  Gli endpoint singoli e lista supportano il parametro `Expand`. Quando fornito, gli oggetti correlati vengono inclusi inline nella risposta anziché restituiti come riferimenti. È possibile specificare espansioni multiple separate da virgola.  ## Gestione errori  L\'API usa codici di stato HTTP standard e restituisce [RFC 7807](https://tools.ietf.org/html/rfc7807) Problem Details in caso di errore:  | Codice | Significato | |-|-| | `400` | Bad Request — validazione fallita o parametro obbligatorio mancante. | | `401` | Unauthorized — token mancante o scaduto. | | `403` | Forbidden — accesso negato (vedi sotto le possibili cause). | | `404` | Not Found — la risorsa richiesta non esiste. | | `409` | Conflict — conflitto di concorrenza. | | `422` | Unprocessable Entity — entità non processabile (es. token di concorrenza obsoleto). |  Un `403` può avere tre cause; nelle ultime due il campo `code` della risposta indica quale:  - il token non possiede lo scope richiesto dall\'endpoint; - `code: cloud_not_active` — l\'account lavora con una connessione locale e la Cloud API non espone i suoi dati. Per attivare il servizio cloud contatta l\'assistenza, poi richiedi un nuovo token: lo stato del servizio è letto al rilascio del token; - `code: company_license_not_active` — la licenza dell\'azienda indicata nel percorso è scaduta o non è attiva. Le altre aziende con licenza attiva restano accessibili.  Il motivo dell\'errore è sempre nel campo `detail`. Ogni risposta di errore riporta inoltre `overridable`: quando vale `true`, l\'errore di validazione è *forzabile* e basta ripetere la stessa richiesta aggiungendo `validationOverride=true` alla query string perché il servizio la accetti. È il caso delle anomalie formali su dati reali — la partita IVA di un fornitore estero, per esempio — che il cliente ha comunque bisogno di registrare.  ## Controllo della concorrenza  Le entità contengono una proprietà `ConcurrencyToken`. Quando si aggiorna un\'entità tramite `PUT`, il token nel body della richiesta viene confrontato con il valore memorizzato. Se differiscono, viene restituito un `422 Unprocessable Entity`. Usare sempre l\'ultimo token ricevuto da una risposta `GET` o `POST`. 
 *
 * The version of the OpenAPI document: 3.2.4
 * Contact: assistenza@gestionaleamica.com
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */

import { mapValues } from '../runtime';
import type { BeneServizio } from './BeneServizio';
import {
    BeneServizioFromJSON,
    BeneServizioFromJSONTyped,
    BeneServizioToJSON,
    BeneServizioToJSONTyped,
} from './BeneServizio';
import type { Scadenza } from './Scadenza';
import {
    ScadenzaFromJSON,
    ScadenzaFromJSONTyped,
    ScadenzaToJSON,
    ScadenzaToJSONTyped,
} from './Scadenza';
import type { DatiSdi } from './DatiSdi';
import {
    DatiSdiFromJSON,
    DatiSdiFromJSONTyped,
    DatiSdiToJSON,
    DatiSdiToJSONTyped,
} from './DatiSdi';
import type { DocumentoMediaFile } from './DocumentoMediaFile';
import {
    DocumentoMediaFileFromJSON,
    DocumentoMediaFileFromJSONTyped,
    DocumentoMediaFileToJSON,
    DocumentoMediaFileToJSONTyped,
} from './DocumentoMediaFile';
import type { Pagamento } from './Pagamento';
import {
    PagamentoFromJSON,
    PagamentoFromJSONTyped,
    PagamentoToJSON,
    PagamentoToJSONTyped,
} from './Pagamento';
import type { CausaleDocumento } from './CausaleDocumento';
import {
    CausaleDocumentoFromJSON,
    CausaleDocumentoFromJSONTyped,
    CausaleDocumentoToJSON,
    CausaleDocumentoToJSONTyped,
} from './CausaleDocumento';
import type { Valuta } from './Valuta';
import {
    ValutaFromJSON,
    ValutaFromJSONTyped,
    ValutaToJSON,
    ValutaToJSONTyped,
} from './Valuta';
import type { SpesaDocumento } from './SpesaDocumento';
import {
    SpesaDocumentoFromJSON,
    SpesaDocumentoFromJSONTyped,
    SpesaDocumentoToJSON,
    SpesaDocumentoToJSONTyped,
} from './SpesaDocumento';
import type { Anagrafica } from './Anagrafica';
import {
    AnagraficaFromJSON,
    AnagraficaFromJSONTyped,
    AnagraficaToJSON,
    AnagraficaToJSONTyped,
} from './Anagrafica';
import type { CausaleMagazzino } from './CausaleMagazzino';
import {
    CausaleMagazzinoFromJSON,
    CausaleMagazzinoFromJSONTyped,
    CausaleMagazzinoToJSON,
    CausaleMagazzinoToJSONTyped,
} from './CausaleMagazzino';
import type { CausaleIva } from './CausaleIva';
import {
    CausaleIvaFromJSON,
    CausaleIvaFromJSONTyped,
    CausaleIvaToJSON,
    CausaleIvaToJSONTyped,
} from './CausaleIva';
import type { DatiPA } from './DatiPA';
import {
    DatiPAFromJSON,
    DatiPAFromJSONTyped,
    DatiPAToJSON,
    DatiPAToJSONTyped,
} from './DatiPA';
import type { Indirizzo } from './Indirizzo';
import {
    IndirizzoFromJSON,
    IndirizzoFromJSONTyped,
    IndirizzoToJSON,
    IndirizzoToJSONTyped,
} from './Indirizzo';
import type { ProgressivoInvio } from './ProgressivoInvio';
import {
    ProgressivoInvioFromJSON,
    ProgressivoInvioFromJSONTyped,
    ProgressivoInvioToJSON,
    ProgressivoInvioToJSONTyped,
} from './ProgressivoInvio';
import type { BancaDocumento } from './BancaDocumento';
import {
    BancaDocumentoFromJSON,
    BancaDocumentoFromJSONTyped,
    BancaDocumentoToJSON,
    BancaDocumentoToJSONTyped,
} from './BancaDocumento';
import type { DatiTrasporto } from './DatiTrasporto';
import {
    DatiTrasportoFromJSON,
    DatiTrasportoFromJSONTyped,
    DatiTrasportoToJSON,
    DatiTrasportoToJSONTyped,
} from './DatiTrasporto';

/**
 * Un documento (fattura, documento di trasporto, ecc.)
 * @export
 * @interface Documento
 */
export interface Documento {
    /**
     * Identificativo univoco.
     * @type {number}
     * @memberof Documento
     */
    id?: number;
    /**
     * Il token di concorrenza implementa il controllo di concorrenza ottimistica: a ogni operazione di aggiornamento o cancellazione il valore del token sul database viene confrontato con quello sull'entità. Se i valori coincidono, l'operazione viene eseguita; se differiscono, si assume che un altro utente abbia effettuato una scrittura nel frattempo e l'aggiornamento viene rifiutato.
     * @type {number}
     * @memberof Documento
     */
    concurrencyToken?: number;
    /**
     * Identificativo univoco di `Anagrafica`.
     * @type {number}
     * @memberof Documento
     */
    anagraficaId?: number;
    /**
     * 
     * @type {Anagrafica}
     * @memberof Documento
     */
    anagrafica?: Anagrafica;
    /**
     * Identificativo univoco di `CausaleDocumento`.
     * @type {number}
     * @memberof Documento
     */
    causaleDocumentoId?: number | null;
    /**
     * 
     * @type {CausaleDocumento}
     * @memberof Documento
     */
    causaleDocumento?: CausaleDocumento;
    /**
     * Identificativo univoco di `Anagrafica` dell'agente.
     * @type {number}
     * @memberof Documento
     */
    agenteId?: number | null;
    /**
     * 
     * @type {Anagrafica}
     * @memberof Documento
     */
    agente?: Anagrafica;
    /**
     * Identificativo univoco di `Pagamento`.
     * @type {number}
     * @memberof Documento
     */
    pagamentoId?: number | null;
    /**
     * 
     * @type {Pagamento}
     * @memberof Documento
     */
    pagamento?: Pagamento;
    /**
     * Identificativo univoco di `Anagrafica` del vettore.
     * @type {number}
     * @memberof Documento
     */
    vettoreId?: number | null;
    /**
     * 
     * @type {Anagrafica}
     * @memberof Documento
     */
    vettore?: Anagrafica;
    /**
     * Identificativo univoco della causale IVA della cassa previdenziale.
     * @type {number}
     * @memberof Documento
     */
    cassaPrevidenzialeCausaleIvaId?: number | null;
    /**
     * Obsoleto. Non utilizzare.
     * @type {number}
     * @memberof Documento
     */
    modelloId?: number | null;
    /**
     * 
     * @type {CausaleIva}
     * @memberof Documento
     */
    cassaPrevidenzialeCausaleIva?: CausaleIva;
    /**
     * Identificativo univoco di `Indirizzo` di destinazione.
     * @type {number}
     * @memberof Documento
     */
    destinazioneId?: number | null;
    /**
     * 
     * @type {Indirizzo}
     * @memberof Documento
     */
    destinazione?: Indirizzo;
    /**
     * Identificativo univoco di `Valuta`.
     * @type {number}
     * @memberof Documento
     */
    valutaId?: number | null;
    /**
     * 
     * @type {Valuta}
     * @memberof Documento
     */
    valuta?: Valuta;
    /**
     * Identificativo univoco di `CausaleMagazzino`.
     * @type {number}
     * @memberof Documento
     */
    causaleMagazzinoId?: number | null;
    /**
     * 
     * @type {CausaleMagazzino}
     * @memberof Documento
     */
    causaleMagazzino?: CausaleMagazzino;
    /**
     * Identificativo univoco della prima causale IVA.
     * @type {number}
     * @memberof Documento
     */
    iva1CausaleIvaId?: number | null;
    /**
     * 
     * @type {CausaleIva}
     * @memberof Documento
     */
    iva1CausaleIva?: CausaleIva;
    /**
     * Identificativo univoco della seconda causale IVA.
     * @type {number}
     * @memberof Documento
     */
    iva2CausaleIvaId?: number | null;
    /**
     * 
     * @type {CausaleIva}
     * @memberof Documento
     */
    iva2CausaleIva?: CausaleIva;
    /**
     * Identificativo univoco della terza causale IVA.
     * @type {number}
     * @memberof Documento
     */
    iva3CausaleIvaId?: number | null;
    /**
     * 
     * @type {CausaleIva}
     * @memberof Documento
     */
    iva3CausaleIva?: CausaleIva;
    /**
     * Identificativo univoco della quarta causale IVA.
     * @type {number}
     * @memberof Documento
     */
    iva4CausaleIvaId?: number | null;
    /**
     * 
     * @type {CausaleIva}
     * @memberof Documento
     */
    iva4CausaleIva?: CausaleIva;
    /**
     * Tipologia del documento.
     * @type {string}
     * @memberof Documento
     */
    tipoDocumento?: DocumentoTipoDocumentoEnum;
    /**
     * Tipo di documento fiscale.
     * @type {string}
     * @memberof Documento
     */
    documentoFiscale?: DocumentoDocumentoFiscaleEnum;
    /**
     * Indica se la destinazione della merce è diversa dall'indirizzo principale.
     * @type {boolean}
     * @memberof Documento
     */
    destinazioneDiversa?: boolean;
    /**
     * Indica se i prezzi inseriti sono da considerarsi al netto dell'IVA. Se `false`, l'IVA verrà scorporata in fase di elaborazione (app ufficiali).
     * @type {boolean}
     * @memberof Documento
     */
    ivaEsclusa?: boolean;
    /**
     * Indica se la ritenuta deve essere applicata anche all'importo della cassa previdenziale riportato nel documento.
     * @type {boolean}
     * @memberof Documento
     */
    ritenutaIncludeCassaPrevidenziale?: boolean;
    /**
     * Classe del documento.
     * @type {string}
     * @memberof Documento
     */
    classeDocumento?: DocumentoClasseDocumentoEnum;
    /**
     * Persona di contatto preferita, `AnagraficaNominativo1` oppure `AnagraficaNominativo2`.
     * @type {number}
     * @memberof Documento
     */
    contatto?: number | null;
    /**
     * La parte alfanumerica del numero del documento, se presente. Ad esempio, "bis" per il documento num. 99/bis.
     * @type {string}
     * @memberof Documento
     */
    numeroParteTesto?: string | null;
    /**
     * Il numero del documento, nella sua parte numerica. Ad esempio, 99 per il num. 99/bis.
     * @type {number}
     * @memberof Documento
     */
    numeroParteNumerica?: number;
    /**
     * Data del documento.
     * @type {Date}
     * @memberof Documento
     */
    data?: Date;
    /**
     * Lo stato corrente del documento. Ad esempio: Bozza, oppure Emesso.
     * @type {string}
     * @memberof Documento
     */
    stato?: DocumentoStatoEnum;
    /**
     * La data di scadenza, nel caso in cui il documento sia un preventivo.
     * @type {Date}
     * @memberof Documento
     */
    dataScadenzaPreventivo?: Date | null;
    /**
     * Data della prima scadenza di pagamento.
     * @type {Date}
     * @memberof Documento
     */
    dataInizioScadenze?: Date | null;
    /**
     * Sconto, in percentuale, da calcolare sull'intero importo del documento.
     * Il valore è una frazione: `0.05` corrisponde al 5%.
     * @type {number}
     * @memberof Documento
     */
    scontoPercentuale?: number;
    /**
     * Sconto, in valuta, da applicare all'intero importo del documento.
     * @type {number}
     * @memberof Documento
     */
    scontoIncondizionatoImporto?: number;
    /**
     * Importo dell'abbuono.
     * @type {number}
     * @memberof Documento
     */
    abbuonoImporto?: number;
    /**
     * Quota della ritenuta da applicare al documento.
     * Il valore è una frazione: `0.20` corrisponde al 20%.
     * @type {number}
     * @memberof Documento
     */
    ritenutaPercentuale?: number;
    /**
     * Contributo Enasarco da applicare al documento.
     * @type {number}
     * @memberof Documento
     */
    enasarcoPercentuale?: number;
    /**
     * Importo Enasarco.
     * @type {number}
     * @memberof Documento
     */
    enasarcoImporto?: number;
    /**
     * Quota dell'imponibile su cui applicare la ritenuta.
     * Il valore è una frazione: `0.50` corrisponde al 50%.
     * @type {number}
     * @memberof Documento
     */
    quotaRitenutaSuImponibile?: number;
    /**
     * Tasso di cambio rispetto all'Euro, nel caso in cui la `Valuta` del documento non sia l'Euro.
     * @type {number}
     * @memberof Documento
     */
    cambio?: number;
    /**
     * Nome della cassa previdenziale applicata al documento.
     * @type {string}
     * @memberof Documento
     */
    cassaPrevidenzialeNome?: string | null;
    /**
     * Aliquota (percentuale) della cassa previdenziale da applicare al documento.
     * Il valore è una frazione: `0.04` corrisponde al 4%.
     * @type {number}
     * @memberof Documento
     */
    cassaPrevidenzialePercentuale?: number;
    /**
     * Note.
     * @type {string}
     * @memberof Documento
     */
    note?: string | null;
    /**
     * Sconto riconosciuto in base alla modalità di pagamento utilizzata (es: +5% in caso di rimessa diretta).
     * Il valore è una frazione: `0.05` corrisponde al 5%.
     * @type {number}
     * @memberof Documento
     */
    scontoPagamentoPercentuale?: number;
    /**
     * Totale imponibile attribuibile a `Iva1CausaleIva`
     * @type {number}
     * @memberof Documento
     */
    iva1Imponibile?: number;
    /**
     * Totale imponibile attribuibile a `Iva2CausaleIva`
     * @type {number}
     * @memberof Documento
     */
    iva2Imponibile?: number;
    /**
     * Totale imponibile attribuibile a `Iva3CausaleIva`
     * @type {number}
     * @memberof Documento
     */
    iva3Imponibile?: number;
    /**
     * Totale imponibile attribuibile a `Iva4CausaleIva`
     * @type {number}
     * @memberof Documento
     */
    iva4Imponibile?: number;
    /**
     * Totale imponibile attribuibile a `Iva1CausaleIva` al lordo di eventuali sconti di fattura.
     * @type {number}
     * @memberof Documento
     */
    iva1ImponibileLordo?: number;
    /**
     * Totale imponibile attribuibile a `Iva2CausaleIva` al lordo di eventuali sconti di fattura.
     * @type {number}
     * @memberof Documento
     */
    iva2ImponibileLordo?: number;
    /**
     * Totale imponibile attribuibile a `Iva3CausaleIva` al lordo di eventuali sconti di fattura.
     * @type {number}
     * @memberof Documento
     */
    iva3ImponibileLordo?: number;
    /**
     * Totale imponibile attribuibile a `Iva4CausaleIva` al lordo di eventuali sconti di fattura.
     * @type {number}
     * @memberof Documento
     */
    iva4ImponibileLordo?: number;
    /**
     * Totale imposta per `Iva1CausaleIva`
     * @type {number}
     * @memberof Documento
     */
    iva1Imposta?: number;
    /**
     * Totale imposta per `Iva2CausaleIva`
     * @type {number}
     * @memberof Documento
     */
    iva2Imposta?: number;
    /**
     * Totale imposta per `Iva3CausaleIva`
     * @type {number}
     * @memberof Documento
     */
    iva3Imposta?: number;
    /**
     * Totale imposta per `Iva4CausaleIva`
     * @type {number}
     * @memberof Documento
     */
    iva4Imposta?: number;
    /**
     * Importo della ritenuta.
     * @type {number}
     * @memberof Documento
     */
    totaleRitenuta?: number;
    /**
     * Importo della cassa previdenziale.
     * @type {number}
     * @memberof Documento
     */
    totaleCassaPrevidenziale?: number;
    /**
     * Totale delle spese esenti e non esenti.
     * @type {number}
     * @memberof Documento
     */
    totaleSpese?: number;
    /**
     * Totale delle spese esenti da IVA.
     * @type {number}
     * @memberof Documento
     */
    totaleSpeseEsenti?: number;
    /**
     * Totale delle spese non esenti da IVA.
     * @type {number}
     * @memberof Documento
     */
    totaleSpeseNonEsenti?: number;
    /**
     * Importo della merce.
     * @type {number}
     * @memberof Documento
     */
    totaleMerce?: number;
    /**
     * Importo della merce scontata.
     * @type {number}
     * @memberof Documento
     */
    totaleMerceScontata?: number;
    /**
     * Totale imponibile, considerando tutte le causali IVA coinvolte.
     * @type {number}
     * @memberof Documento
     */
    totaleImponibile?: number;
    /**
     * Imposta IVA.
     * @type {number}
     * @memberof Documento
     */
    totaleImposta?: number;
    /**
     * Importi esenti da IVA.
     * @type {number}
     * @memberof Documento
     */
    totaleEsente?: number;
    /**
     * Importo totale del documento.
     * @type {number}
     * @memberof Documento
     */
    totaleDocumento?: number;
    /**
     * Netto a pagare.
     * @type {number}
     * @memberof Documento
     */
    nettoAPagare?: number;
    /**
     * Importo dello split payment.
     * @type {number}
     * @memberof Documento
     */
    totaleSplitPayment?: number;
    /**
     * Importo del bollo.
     * @type {number}
     * @memberof Documento
     */
    bollo?: number;
    /**
     * Nome del file XML.
     * @type {string}
     * @memberof Documento
     */
    xmlFileName?: string | null;
    /**
     * Numero di riferimento dell'amministrazione.
     * @type {string}
     * @memberof Documento
     */
    riferimentoAmministrazione?: string | null;
    /**
     * 
     * @type {BancaDocumento}
     * @memberof Documento
     */
    banca?: BancaDocumento;
    /**
     * 
     * @type {DatiTrasporto}
     * @memberof Documento
     */
    datiTrasporto?: DatiTrasporto;
    /**
     * 
     * @type {DatiSdi}
     * @memberof Documento
     */
    datiSdi?: DatiSdi;
    /**
     * 
     * @type {DatiPA}
     * @memberof Documento
     */
    datiPA?: DatiPA;
    /**
     * Righe del documento.
     * @type {Array<BeneServizio>}
     * @memberof Documento
     */
    righe?: Array<BeneServizio> | null;
    /**
     * Elenco delle spese.
     * @type {Array<SpesaDocumento>}
     * @memberof Documento
     */
    speseDocumento?: Array<SpesaDocumento> | null;
    /**
     * Elenco delle scadenze.
     * @type {Array<Scadenza>}
     * @memberof Documento
     */
    scadenze?: Array<Scadenza> | null;
    /**
     * Numero completo del documento. Ad esempio, `99/bis`. Generato a partire da `NumeroParteNumerica` e `NumeroParteTesto`. Nota bene: proprietà valorizzata solo nel caso di un'istanza salvata sul backend.
     * @type {string}
     * @memberof Documento
     */
    numero?: string | null;
    /**
     * 
     * @type {DocumentoMediaFile}
     * @memberof Documento
     */
    mediaFile?: DocumentoMediaFile;
    /**
     * Obsoleto. Non utilizzare.
     * @type {string}
     * @memberof Documento
     */
    allegato?: string | null;
    /**
     * Causale del bonus fiscale.
     * @type {string}
     * @memberof Documento
     */
    bonusFiscaleCausale?: string | null;
    /**
     * Importo del bonus fiscale.
     * @type {number}
     * @memberof Documento
     */
    bonusFiscaleImporto?: number;
    /**
     * Percentuale del bonus fiscale.
     * Il valore è una frazione: `0.50` corrisponde al 50%.
     * @type {number}
     * @memberof Documento
     */
    bonusFiscalePercentuale?: number;
    /**
     * Numeri di invio (progressivi), così come restituiti dallo Sdi.
     * @type {Array<ProgressivoInvio>}
     * @memberof Documento
     */
    progressivoInvio?: Array<ProgressivoInvio> | null;
}


/**
 * @export
 */
export const DocumentoTipoDocumentoEnum = {
    Ddt: 'Ddt',
    FatturaAccompagnatoria: 'FatturaAccompagnatoria',
    FatturaAcconto: 'FatturaAcconto',
    FatturaDifferita: 'FatturaDifferita',
    FatturaProfessionista: 'FatturaProfessionista',
    RicevutaFiscale: 'RicevutaFiscale',
    NotaCredito: 'NotaCredito',
    NotaDebito: 'NotaDebito',
    Scontrino: 'Scontrino',
    OrdineCliente: 'OrdineCliente',
    Preventivo: 'Preventivo',
    DdtFornitore: 'DdtFornitore',
    FatturaAccompagnatoriaFornitore: 'FatturaAccompagnatoriaFornitore',
    FatturaDifferitaFornitore: 'FatturaDifferitaFornitore',
    FatturaProfessionistaFornitore: 'FatturaProfessionistaFornitore',
    NotaCreditoFornitore: 'NotaCreditoFornitore',
    NotaDebitoFornitore: 'NotaDebitoFornitore',
    PreventivoFornitore: 'PreventivoFornitore',
    OrdineFornitore: 'OrdineFornitore',
    ResoCliente: 'ResoCliente',
    FatturaAccontoFornitore: 'FatturaAccontoFornitore',
    FatturaProForma: 'FatturaProForma',
    IntegrazioneFatturaReverseChargeInterno: 'IntegrazioneFatturaReverseChargeInterno',
    IntegrazioneAcquistoServiziEstero: 'IntegrazioneAcquistoServiziEstero',
    IntegrazioneAcquistoBeniIntracomunitari: 'IntegrazioneAcquistoBeniIntracomunitari',
    IntegrazioneAcquistoBeniArt17: 'IntegrazioneAcquistoBeniArt17',
    AutofatturaRegolarizzazioneFatture: 'AutofatturaRegolarizzazioneFatture',
    AutofatturaSplafonamento: 'AutofatturaSplafonamento',
    EstrazioneBeniDepositoIva: 'EstrazioneBeniDepositoIva',
    EstrazioneBeniDepositoIvaConVersamentoIva: 'EstrazioneBeniDepositoIvaConVersamentoIva',
    FatturaDifferitaArt21Comma4LetteraA: 'FatturaDifferitaArt21Comma4LetteraA',
    FatturaDifferitaArt21Comma4LetteraB: 'FatturaDifferitaArt21Comma4LetteraB',
    CessioniBeniAmmortizzabiliEPassaggiInterni: 'CessioniBeniAmmortizzabiliEPassaggiInterni',
    FatturaAutoconsumoOCessioniGratuite: 'FatturaAutoconsumoOCessioniGratuite',
    IntegrazioneFatturaReverseChargeInternoFornitore: 'IntegrazioneFatturaReverseChargeInternoFornitore',
    IntegrazioneAcquistoServiziEsteroFornitore: 'IntegrazioneAcquistoServiziEsteroFornitore',
    IntegrazioneAcquistoBeniIntracomunitariFornitore: 'IntegrazioneAcquistoBeniIntracomunitariFornitore',
    IntegrazioneAcquistoBeniArt17Fornitore: 'IntegrazioneAcquistoBeniArt17Fornitore',
    AutofatturaRegolarizzazioneFattureFornitore: 'AutofatturaRegolarizzazioneFattureFornitore',
    AutofatturaSplafonamentoFornitore: 'AutofatturaSplafonamentoFornitore',
    EstrazioneBeniDepositoIvaFornitore: 'EstrazioneBeniDepositoIvaFornitore',
    EstrazioneBeniDepositoIvaConVersamentoIvaFornitore: 'EstrazioneBeniDepositoIvaConVersamentoIvaFornitore',
    FatturaDifferitaArt21Comma4LetteraAFornitore: 'FatturaDifferitaArt21Comma4LetteraAFornitore',
    FatturaDifferitaArt21Comma4LetteraBFornitore: 'FatturaDifferitaArt21Comma4LetteraBFornitore',
    CessioniBeniAmmortizzabiliEPassaggiInterniFornitore: 'CessioniBeniAmmortizzabiliEPassaggiInterniFornitore',
    FatturaAutoconsumoOCessioniGratuiteFornitore: 'FatturaAutoconsumoOCessioniGratuiteFornitore',
    AcquistoSanMarinoConIva: 'AcquistoSanMarinoConIva',
    ComunicazioneOmessaOIrregolareFatturazione: 'ComunicazioneOmessaOIrregolareFatturazione',
    ComunicazioneOmessaOIrregolareFatturazioneFornitore: 'ComunicazioneOmessaOIrregolareFatturazioneFornitore'
} as const;
export type DocumentoTipoDocumentoEnum = typeof DocumentoTipoDocumentoEnum[keyof typeof DocumentoTipoDocumentoEnum];

/**
 * @export
 */
export const DocumentoDocumentoFiscaleEnum = {
    Vendita: 'Vendita',
    Acquisto: 'Acquisto',
    NonFiscale: 'NonFiscale'
} as const;
export type DocumentoDocumentoFiscaleEnum = typeof DocumentoDocumentoFiscaleEnum[keyof typeof DocumentoDocumentoFiscaleEnum];

/**
 * @export
 */
export const DocumentoClasseDocumentoEnum = {
    Vendita: 'Vendita',
    Acquisto: 'Acquisto'
} as const;
export type DocumentoClasseDocumentoEnum = typeof DocumentoClasseDocumentoEnum[keyof typeof DocumentoClasseDocumentoEnum];

/**
 * @export
 */
export const DocumentoStatoEnum = {
    Bozza: 'Bozza',
    Fatturato: 'Fatturato',
    Emesso: 'Emesso',
    FatturaAccontoScontataInFattura: 'FatturaAccontoScontataInFattura',
    PreventivoChiuso: 'PreventivoChiuso',
    OrdineEvaso: 'OrdineEvaso',
    OrdineParzialmenteEvaso: 'OrdineParzialmenteEvaso',
    OrdineAnnullato: 'OrdineAnnullato',
    ResoAccreditato: 'ResoAccreditato',
    DdtNonFatturare: 'DdtNonFatturare'
} as const;
export type DocumentoStatoEnum = typeof DocumentoStatoEnum[keyof typeof DocumentoStatoEnum];


/**
 * Check if a given object implements the Documento interface.
 */
export function instanceOfDocumento(value: object): value is Documento {
    return true;
}

export function DocumentoFromJSON(json: any): Documento {
    return DocumentoFromJSONTyped(json, false);
}

export function DocumentoFromJSONTyped(json: any, ignoreDiscriminator: boolean): Documento {
    if (json == null) {
        return json;
    }
    return {
        
        'id': json['id'] == null ? undefined : json['id'],
        'concurrencyToken': json['concurrencyToken'] == null ? undefined : json['concurrencyToken'],
        'anagraficaId': json['anagraficaId'] == null ? undefined : json['anagraficaId'],
        'anagrafica': json['anagrafica'] == null ? undefined : AnagraficaFromJSON(json['anagrafica']),
        'causaleDocumentoId': json['causaleDocumentoId'] == null ? undefined : json['causaleDocumentoId'],
        'causaleDocumento': json['causaleDocumento'] == null ? undefined : CausaleDocumentoFromJSON(json['causaleDocumento']),
        'agenteId': json['agenteId'] == null ? undefined : json['agenteId'],
        'agente': json['agente'] == null ? undefined : AnagraficaFromJSON(json['agente']),
        'pagamentoId': json['pagamentoId'] == null ? undefined : json['pagamentoId'],
        'pagamento': json['pagamento'] == null ? undefined : PagamentoFromJSON(json['pagamento']),
        'vettoreId': json['vettoreId'] == null ? undefined : json['vettoreId'],
        'vettore': json['vettore'] == null ? undefined : AnagraficaFromJSON(json['vettore']),
        'cassaPrevidenzialeCausaleIvaId': json['cassaPrevidenzialeCausaleIvaId'] == null ? undefined : json['cassaPrevidenzialeCausaleIvaId'],
        'modelloId': json['modelloId'] == null ? undefined : json['modelloId'],
        'cassaPrevidenzialeCausaleIva': json['cassaPrevidenzialeCausaleIva'] == null ? undefined : CausaleIvaFromJSON(json['cassaPrevidenzialeCausaleIva']),
        'destinazioneId': json['destinazioneId'] == null ? undefined : json['destinazioneId'],
        'destinazione': json['destinazione'] == null ? undefined : IndirizzoFromJSON(json['destinazione']),
        'valutaId': json['valutaId'] == null ? undefined : json['valutaId'],
        'valuta': json['valuta'] == null ? undefined : ValutaFromJSON(json['valuta']),
        'causaleMagazzinoId': json['causaleMagazzinoId'] == null ? undefined : json['causaleMagazzinoId'],
        'causaleMagazzino': json['causaleMagazzino'] == null ? undefined : CausaleMagazzinoFromJSON(json['causaleMagazzino']),
        'iva1CausaleIvaId': json['iva1CausaleIvaId'] == null ? undefined : json['iva1CausaleIvaId'],
        'iva1CausaleIva': json['iva1CausaleIva'] == null ? undefined : CausaleIvaFromJSON(json['iva1CausaleIva']),
        'iva2CausaleIvaId': json['iva2CausaleIvaId'] == null ? undefined : json['iva2CausaleIvaId'],
        'iva2CausaleIva': json['iva2CausaleIva'] == null ? undefined : CausaleIvaFromJSON(json['iva2CausaleIva']),
        'iva3CausaleIvaId': json['iva3CausaleIvaId'] == null ? undefined : json['iva3CausaleIvaId'],
        'iva3CausaleIva': json['iva3CausaleIva'] == null ? undefined : CausaleIvaFromJSON(json['iva3CausaleIva']),
        'iva4CausaleIvaId': json['iva4CausaleIvaId'] == null ? undefined : json['iva4CausaleIvaId'],
        'iva4CausaleIva': json['iva4CausaleIva'] == null ? undefined : CausaleIvaFromJSON(json['iva4CausaleIva']),
        'tipoDocumento': json['tipoDocumento'] == null ? undefined : json['tipoDocumento'],
        'documentoFiscale': json['documentoFiscale'] == null ? undefined : json['documentoFiscale'],
        'destinazioneDiversa': json['destinazioneDiversa'] == null ? undefined : json['destinazioneDiversa'],
        'ivaEsclusa': json['ivaEsclusa'] == null ? undefined : json['ivaEsclusa'],
        'ritenutaIncludeCassaPrevidenziale': json['ritenutaIncludeCassaPrevidenziale'] == null ? undefined : json['ritenutaIncludeCassaPrevidenziale'],
        'classeDocumento': json['classeDocumento'] == null ? undefined : json['classeDocumento'],
        'contatto': json['contatto'] == null ? undefined : json['contatto'],
        'numeroParteTesto': json['numeroParteTesto'] == null ? undefined : json['numeroParteTesto'],
        'numeroParteNumerica': json['numeroParteNumerica'] == null ? undefined : json['numeroParteNumerica'],
        'data': json['data'] == null ? undefined : (new Date(json['data'])),
        'stato': json['stato'] == null ? undefined : json['stato'],
        'dataScadenzaPreventivo': json['dataScadenzaPreventivo'] == null ? undefined : (new Date(json['dataScadenzaPreventivo'])),
        'dataInizioScadenze': json['dataInizioScadenze'] == null ? undefined : (new Date(json['dataInizioScadenze'])),
        'scontoPercentuale': json['scontoPercentuale'] == null ? undefined : json['scontoPercentuale'],
        'scontoIncondizionatoImporto': json['scontoIncondizionatoImporto'] == null ? undefined : json['scontoIncondizionatoImporto'],
        'abbuonoImporto': json['abbuonoImporto'] == null ? undefined : json['abbuonoImporto'],
        'ritenutaPercentuale': json['ritenutaPercentuale'] == null ? undefined : json['ritenutaPercentuale'],
        'enasarcoPercentuale': json['enasarcoPercentuale'] == null ? undefined : json['enasarcoPercentuale'],
        'enasarcoImporto': json['enasarcoImporto'] == null ? undefined : json['enasarcoImporto'],
        'quotaRitenutaSuImponibile': json['quotaRitenutaSuImponibile'] == null ? undefined : json['quotaRitenutaSuImponibile'],
        'cambio': json['cambio'] == null ? undefined : json['cambio'],
        'cassaPrevidenzialeNome': json['cassaPrevidenzialeNome'] == null ? undefined : json['cassaPrevidenzialeNome'],
        'cassaPrevidenzialePercentuale': json['cassaPrevidenzialePercentuale'] == null ? undefined : json['cassaPrevidenzialePercentuale'],
        'note': json['note'] == null ? undefined : json['note'],
        'scontoPagamentoPercentuale': json['scontoPagamentoPercentuale'] == null ? undefined : json['scontoPagamentoPercentuale'],
        'iva1Imponibile': json['iva1Imponibile'] == null ? undefined : json['iva1Imponibile'],
        'iva2Imponibile': json['iva2Imponibile'] == null ? undefined : json['iva2Imponibile'],
        'iva3Imponibile': json['iva3Imponibile'] == null ? undefined : json['iva3Imponibile'],
        'iva4Imponibile': json['iva4Imponibile'] == null ? undefined : json['iva4Imponibile'],
        'iva1ImponibileLordo': json['iva1ImponibileLordo'] == null ? undefined : json['iva1ImponibileLordo'],
        'iva2ImponibileLordo': json['iva2ImponibileLordo'] == null ? undefined : json['iva2ImponibileLordo'],
        'iva3ImponibileLordo': json['iva3ImponibileLordo'] == null ? undefined : json['iva3ImponibileLordo'],
        'iva4ImponibileLordo': json['iva4ImponibileLordo'] == null ? undefined : json['iva4ImponibileLordo'],
        'iva1Imposta': json['iva1Imposta'] == null ? undefined : json['iva1Imposta'],
        'iva2Imposta': json['iva2Imposta'] == null ? undefined : json['iva2Imposta'],
        'iva3Imposta': json['iva3Imposta'] == null ? undefined : json['iva3Imposta'],
        'iva4Imposta': json['iva4Imposta'] == null ? undefined : json['iva4Imposta'],
        'totaleRitenuta': json['totaleRitenuta'] == null ? undefined : json['totaleRitenuta'],
        'totaleCassaPrevidenziale': json['totaleCassaPrevidenziale'] == null ? undefined : json['totaleCassaPrevidenziale'],
        'totaleSpese': json['totaleSpese'] == null ? undefined : json['totaleSpese'],
        'totaleSpeseEsenti': json['totaleSpeseEsenti'] == null ? undefined : json['totaleSpeseEsenti'],
        'totaleSpeseNonEsenti': json['totaleSpeseNonEsenti'] == null ? undefined : json['totaleSpeseNonEsenti'],
        'totaleMerce': json['totaleMerce'] == null ? undefined : json['totaleMerce'],
        'totaleMerceScontata': json['totaleMerceScontata'] == null ? undefined : json['totaleMerceScontata'],
        'totaleImponibile': json['totaleImponibile'] == null ? undefined : json['totaleImponibile'],
        'totaleImposta': json['totaleImposta'] == null ? undefined : json['totaleImposta'],
        'totaleEsente': json['totaleEsente'] == null ? undefined : json['totaleEsente'],
        'totaleDocumento': json['totaleDocumento'] == null ? undefined : json['totaleDocumento'],
        'nettoAPagare': json['nettoAPagare'] == null ? undefined : json['nettoAPagare'],
        'totaleSplitPayment': json['totaleSplitPayment'] == null ? undefined : json['totaleSplitPayment'],
        'bollo': json['bollo'] == null ? undefined : json['bollo'],
        'xmlFileName': json['xmlFileName'] == null ? undefined : json['xmlFileName'],
        'riferimentoAmministrazione': json['riferimentoAmministrazione'] == null ? undefined : json['riferimentoAmministrazione'],
        'banca': json['banca'] == null ? undefined : BancaDocumentoFromJSON(json['banca']),
        'datiTrasporto': json['datiTrasporto'] == null ? undefined : DatiTrasportoFromJSON(json['datiTrasporto']),
        'datiSdi': json['datiSdi'] == null ? undefined : DatiSdiFromJSON(json['datiSdi']),
        'datiPA': json['datiPA'] == null ? undefined : DatiPAFromJSON(json['datiPA']),
        'righe': json['righe'] == null ? undefined : ((json['righe'] as Array<any>).map(BeneServizioFromJSON)),
        'speseDocumento': json['speseDocumento'] == null ? undefined : ((json['speseDocumento'] as Array<any>).map(SpesaDocumentoFromJSON)),
        'scadenze': json['scadenze'] == null ? undefined : ((json['scadenze'] as Array<any>).map(ScadenzaFromJSON)),
        'numero': json['numero'] == null ? undefined : json['numero'],
        'mediaFile': json['mediaFile'] == null ? undefined : DocumentoMediaFileFromJSON(json['mediaFile']),
        'allegato': json['allegato'] == null ? undefined : json['allegato'],
        'bonusFiscaleCausale': json['bonusFiscaleCausale'] == null ? undefined : json['bonusFiscaleCausale'],
        'bonusFiscaleImporto': json['bonusFiscaleImporto'] == null ? undefined : json['bonusFiscaleImporto'],
        'bonusFiscalePercentuale': json['bonusFiscalePercentuale'] == null ? undefined : json['bonusFiscalePercentuale'],
        'progressivoInvio': json['progressivoInvio'] == null ? undefined : ((json['progressivoInvio'] as Array<any>).map(ProgressivoInvioFromJSON)),
    };
}

export function DocumentoToJSON(json: any): Documento {
    return DocumentoToJSONTyped(json, false);
}

export function DocumentoToJSONTyped(value?: Documento | null, ignoreDiscriminator: boolean = false): any {
    if (value == null) {
        return value;
    }

    return {
        
        'id': value['id'],
        'concurrencyToken': value['concurrencyToken'],
        'anagraficaId': value['anagraficaId'],
        'anagrafica': AnagraficaToJSON(value['anagrafica']),
        'causaleDocumentoId': value['causaleDocumentoId'],
        'causaleDocumento': CausaleDocumentoToJSON(value['causaleDocumento']),
        'agenteId': value['agenteId'],
        'agente': AnagraficaToJSON(value['agente']),
        'pagamentoId': value['pagamentoId'],
        'pagamento': PagamentoToJSON(value['pagamento']),
        'vettoreId': value['vettoreId'],
        'vettore': AnagraficaToJSON(value['vettore']),
        'cassaPrevidenzialeCausaleIvaId': value['cassaPrevidenzialeCausaleIvaId'],
        'modelloId': value['modelloId'],
        'cassaPrevidenzialeCausaleIva': CausaleIvaToJSON(value['cassaPrevidenzialeCausaleIva']),
        'destinazioneId': value['destinazioneId'],
        'destinazione': IndirizzoToJSON(value['destinazione']),
        'valutaId': value['valutaId'],
        'valuta': ValutaToJSON(value['valuta']),
        'causaleMagazzinoId': value['causaleMagazzinoId'],
        'causaleMagazzino': CausaleMagazzinoToJSON(value['causaleMagazzino']),
        'iva1CausaleIvaId': value['iva1CausaleIvaId'],
        'iva1CausaleIva': CausaleIvaToJSON(value['iva1CausaleIva']),
        'iva2CausaleIvaId': value['iva2CausaleIvaId'],
        'iva2CausaleIva': CausaleIvaToJSON(value['iva2CausaleIva']),
        'iva3CausaleIvaId': value['iva3CausaleIvaId'],
        'iva3CausaleIva': CausaleIvaToJSON(value['iva3CausaleIva']),
        'iva4CausaleIvaId': value['iva4CausaleIvaId'],
        'iva4CausaleIva': CausaleIvaToJSON(value['iva4CausaleIva']),
        'tipoDocumento': value['tipoDocumento'],
        'documentoFiscale': value['documentoFiscale'],
        'destinazioneDiversa': value['destinazioneDiversa'],
        'ivaEsclusa': value['ivaEsclusa'],
        'ritenutaIncludeCassaPrevidenziale': value['ritenutaIncludeCassaPrevidenziale'],
        'classeDocumento': value['classeDocumento'],
        'contatto': value['contatto'],
        'numeroParteTesto': value['numeroParteTesto'],
        'numeroParteNumerica': value['numeroParteNumerica'],
        'data': value['data'] == null ? undefined : ((value['data']).toISOString()),
        'stato': value['stato'],
        'dataScadenzaPreventivo': value['dataScadenzaPreventivo'] == null ? undefined : ((value['dataScadenzaPreventivo'] as any).toISOString()),
        'dataInizioScadenze': value['dataInizioScadenze'] == null ? undefined : ((value['dataInizioScadenze'] as any).toISOString()),
        'scontoPercentuale': value['scontoPercentuale'],
        'scontoIncondizionatoImporto': value['scontoIncondizionatoImporto'],
        'abbuonoImporto': value['abbuonoImporto'],
        'ritenutaPercentuale': value['ritenutaPercentuale'],
        'enasarcoPercentuale': value['enasarcoPercentuale'],
        'enasarcoImporto': value['enasarcoImporto'],
        'quotaRitenutaSuImponibile': value['quotaRitenutaSuImponibile'],
        'cambio': value['cambio'],
        'cassaPrevidenzialeNome': value['cassaPrevidenzialeNome'],
        'cassaPrevidenzialePercentuale': value['cassaPrevidenzialePercentuale'],
        'note': value['note'],
        'scontoPagamentoPercentuale': value['scontoPagamentoPercentuale'],
        'iva1Imponibile': value['iva1Imponibile'],
        'iva2Imponibile': value['iva2Imponibile'],
        'iva3Imponibile': value['iva3Imponibile'],
        'iva4Imponibile': value['iva4Imponibile'],
        'iva1ImponibileLordo': value['iva1ImponibileLordo'],
        'iva2ImponibileLordo': value['iva2ImponibileLordo'],
        'iva3ImponibileLordo': value['iva3ImponibileLordo'],
        'iva4ImponibileLordo': value['iva4ImponibileLordo'],
        'iva1Imposta': value['iva1Imposta'],
        'iva2Imposta': value['iva2Imposta'],
        'iva3Imposta': value['iva3Imposta'],
        'iva4Imposta': value['iva4Imposta'],
        'totaleRitenuta': value['totaleRitenuta'],
        'totaleCassaPrevidenziale': value['totaleCassaPrevidenziale'],
        'totaleSpese': value['totaleSpese'],
        'totaleSpeseEsenti': value['totaleSpeseEsenti'],
        'totaleSpeseNonEsenti': value['totaleSpeseNonEsenti'],
        'totaleMerce': value['totaleMerce'],
        'totaleMerceScontata': value['totaleMerceScontata'],
        'totaleImponibile': value['totaleImponibile'],
        'totaleImposta': value['totaleImposta'],
        'totaleEsente': value['totaleEsente'],
        'totaleDocumento': value['totaleDocumento'],
        'nettoAPagare': value['nettoAPagare'],
        'totaleSplitPayment': value['totaleSplitPayment'],
        'bollo': value['bollo'],
        'xmlFileName': value['xmlFileName'],
        'riferimentoAmministrazione': value['riferimentoAmministrazione'],
        'banca': BancaDocumentoToJSON(value['banca']),
        'datiTrasporto': DatiTrasportoToJSON(value['datiTrasporto']),
        'datiSdi': DatiSdiToJSON(value['datiSdi']),
        'datiPA': DatiPAToJSON(value['datiPA']),
        'righe': value['righe'] == null ? undefined : ((value['righe'] as Array<any>).map(BeneServizioToJSON)),
        'speseDocumento': value['speseDocumento'] == null ? undefined : ((value['speseDocumento'] as Array<any>).map(SpesaDocumentoToJSON)),
        'scadenze': value['scadenze'] == null ? undefined : ((value['scadenze'] as Array<any>).map(ScadenzaToJSON)),
        'numero': value['numero'],
        'mediaFile': DocumentoMediaFileToJSON(value['mediaFile']),
        'allegato': value['allegato'],
        'bonusFiscaleCausale': value['bonusFiscaleCausale'],
        'bonusFiscaleImporto': value['bonusFiscaleImporto'],
        'bonusFiscalePercentuale': value['bonusFiscalePercentuale'],
        'progressivoInvio': value['progressivoInvio'] == null ? undefined : ((value['progressivoInvio'] as Array<any>).map(ProgressivoInvioToJSON)),
    };
}

