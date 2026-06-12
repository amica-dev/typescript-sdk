/* tslint:disable */
/* eslint-disable */
/**
 * Amica Cloud API
 * L\'Amica Cloud API fornisce accesso programmatico a tutti i dati aziendali gestiti da [Amica 20](https://gestionaleamica.com). Supporta il ciclo completo di documenti, fatture, magazzino, contabilità e anagrafiche. Per guide e documentazione completa, visitare [amica.dev](https://amica.dev/).  ## Autenticazione  Tutte le richieste API richiedono un token OAuth 2.0 Bearer valido, da includere nell\'header `Authorization`:  ``` Authorization: Bearer <token> ```  ### Registra la tua app  Per integrare l\'Amica Cloud API registra la tua applicazione sull\'**App Store di Amica**. Al termine della registrazione ottieni una coppia di credenziali OAuth 2.0 — `client_id` e `client_secret` (il secret è mostrato **una sola volta**) — e scegli gli **scope** e il **flusso di autenticazione** desiderati.  ### Scegli il flusso  - **Authorization Code con PKCE** (consigliato per app che operano per conto di un utente Amica): l\'utente autorizza la tua app tramite la pagina di consenso dell\'identity provider; la tua app riceve un `code` da scambiare con un access token.    ```   GET  {identity-provider}/connect/authorize?response_type=code&client_id=<client_id>&redirect_uri=<redirect_uri>&scope=openid%20read%20write%20documenti&code_challenge=<challenge>&code_challenge_method=S256   POST {identity-provider}/connect/token        grant_type=authorization_code&code=<code>&code_verifier=<verifier>&client_id=<client_id>&client_secret=<client_secret>&redirect_uri=<redirect_uri>   ```  - **Client Credentials** (per integrazioni server-to-server, senza utente interattivo):    ```   POST {identity-provider}/connect/token   Content-Type: application/x-www-form-urlencoded    grant_type=client_credentials&client_id=<client_id>&client_secret=<client_secret>&scope=read write documenti contabilita   ```    > **Nota:** il flusso Client Credentials è disponibile solo per le **app private**, non per quelle pubblicate sul marketplace.  In entrambi i casi la risposta contiene l\'`access_token` (JWT con `aud: amica-cloud`) da usare nelle chiamate successive finché non scade (`expires_in`), dopodiché va richiesto un nuovo token. Ogni token contiene uno o più **scope** che determinano le aree accessibili (vedi sotto). Dalla [API Reference](https://amica.dev) è possibile incollare un access token per provare gli endpoint direttamente dal browser.  ## Scope di autorizzazione  L\'accesso agli endpoint è governato dagli scope presenti nel token OAuth:  | Scope | Descrizione | |-|-| | `comune` | Anagrafiche: contatti, indirizzi, nazioni, valute, modalità di pagamento, ecc. | | `magazzino` | Magazzino: articoli, listini, movimenti di magazzino, giacenze, distinte base. | | `contabilita` | Contabilità: registrazioni contabili, scadenze, castelletti IVA, fatture elettroniche XML. | | `documenti` | Documenti: fatture, note di credito, DDT, ordini, preventivi, proforma ed emissione. |  Una richiesta verso un endpoint non coperto dallo scope del token riceverà una risposta `403 Forbidden`.  ## Company ID  La maggior parte degli endpoint è relativa a una specifica azienda e segue il pattern:  ``` /api/v3/{companyId}/risorsa ```  Il `companyId` è l\'identificativo univoco di ciascun database aziendale. Usare l\'endpoint `GET /api/v3/config/Azienda` per ottenere l\'elenco delle aziende disponibili.  ## Paginazione  Gli endpoint che restituiscono liste supportano la paginazione tramite query parameter:  | Parametro | Descrizione | |-|-| | `Skip` | Numero di elementi da saltare dall\'inizio del set di risultati. | | `Take` | Numero di elementi da includere nella risposta. |  La risposta include due header:  | Header | Descrizione | |-|-| | `X-Read-TotalCount` | Numero totale di elementi che soddisfano il filtro corrente. | | `X-Read-Count` | Numero di elementi effettivamente restituiti nel body della risposta. |  ## Ordinamento e filtri  Gli endpoint lista accettano parametri aggiuntivi:  | Parametro | Descrizione | |-|-| | `Order` | Lista di proprietà per l\'ordinamento, separate da virgola. Un segno meno (`-`) prima del nome indica ordine discendente. Es. `-RagioneSociale1,Citta`. | | `Filter` | Condizioni di ricerca: lista di espressioni separate da virgola, ciascuna formata da nome campo, operatore, valore ed eventuale connettore logico. Operatori: `$eq`, `$ne`, `$gt`, `$lt`, `$lte`, `$gte`, `$ct` (contiene), `$nct`, `$sw` (inizia con), `$ew` (finisce con). Connettori: `$and` (default, omissibile) e `$or`; le sotto-query si racchiudono tra `[]`. Es. `RagioneSociale1 $ct acme $or, Fido $gt 1000`. | | `SkipTotalCount` | Se `true`, l\'header `X-Read-TotalCount` viene omesso dalla risposta: migliori prestazioni a scapito del conteggio totale. Default `false`. |  ## Espansione oggetti correlati  Gli endpoint singoli e lista supportano il parametro `Expand`. Quando fornito, gli oggetti correlati vengono inclusi inline nella risposta anziché restituiti come riferimenti. È possibile specificare espansioni multiple separate da virgola.  ## Gestione errori  L\'API usa codici di stato HTTP standard e restituisce [RFC 7807](https://tools.ietf.org/html/rfc7807) Problem Details in caso di errore:  | Codice | Significato | |-|-| | `400` | Bad Request — validazione fallita o parametro obbligatorio mancante. | | `401` | Unauthorized — token mancante o scaduto. | | `403` | Forbidden — il token non possiede lo scope richiesto. | | `404` | Not Found — la risorsa richiesta non esiste. | | `409` | Conflict — conflitto di concorrenza. | | `422` | Unprocessable Entity — entità non processabile (es. token di concorrenza obsoleto). |  Alcune risposte `400` includono un campo `overridable` che indica se l\'errore di validazione può essere ignorato impostando il parametro `validationOverride` a `true`.  ## Controllo della concorrenza  Le entità contengono una proprietà `ConcurrencyToken`. Quando si aggiorna un\'entità tramite `PUT`, il token nel body della richiesta viene confrontato con il valore memorizzato. Se differiscono, viene restituito un `422 Unprocessable Entity`. Usare sempre l\'ultimo token ricevuto da una risposta `GET` o `POST`. 
 *
 * The version of the OpenAPI document: v3
 * Contact: assistenza@gestionaleamica.com
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */

import { mapValues } from '../runtime';
import type { RegistrazioneContabile } from './RegistrazioneContabile';
import {
    RegistrazioneContabileFromJSON,
    RegistrazioneContabileFromJSONTyped,
    RegistrazioneContabileToJSON,
    RegistrazioneContabileToJSONTyped,
} from './RegistrazioneContabile';
import type { Anagrafica } from './Anagrafica';
import {
    AnagraficaFromJSON,
    AnagraficaFromJSONTyped,
    AnagraficaToJSON,
    AnagraficaToJSONTyped,
} from './Anagrafica';
import type { ModalitaPagamento } from './ModalitaPagamento';
import {
    ModalitaPagamentoFromJSON,
    ModalitaPagamentoFromJSONTyped,
    ModalitaPagamentoToJSON,
    ModalitaPagamentoToJSONTyped,
} from './ModalitaPagamento';
import type { Documento } from './Documento';
import {
    DocumentoFromJSON,
    DocumentoFromJSONTyped,
    DocumentoToJSON,
    DocumentoToJSONTyped,
} from './Documento';

/**
 * Scadenza di pagamento.
 * @export
 * @interface Scadenza
 */
export interface Scadenza {
    /**
     * Identificativo univoco.
     * @type {number}
     * @memberof Scadenza
     */
    id?: number;
    /**
     * Il token di concorrenza implementa il controllo di concorrenza ottimistica: a ogni operazione di aggiornamento o cancellazione il valore del token sul database viene confrontato con quello sull'entità. Se i valori coincidono, l'operazione viene eseguita; se differiscono, si assume che un altro utente abbia effettuato una scrittura nel frattempo e l'aggiornamento viene rifiutato.
     * @type {number}
     * @memberof Scadenza
     */
    concurrencyToken?: number;
    /**
     * Identificativo univoco di Amica.Scadenza.RegistrazioneContabile.
     * @type {number}
     * @memberof Scadenza
     */
    registrazioneContabileId?: number | null;
    /**
     * 
     * @type {RegistrazioneContabile}
     * @memberof Scadenza
     */
    registrazioneContabile?: RegistrazioneContabile;
    /**
     * Identificativo univoco di Amica.Scadenza.Anagrafica.
     * @type {number}
     * @memberof Scadenza
     */
    anagraficaId?: number | null;
    /**
     * 
     * @type {Anagrafica}
     * @memberof Scadenza
     */
    anagrafica?: Anagrafica;
    /**
     * Identificativo univoco di Amica.Scadenza.Documento.
     * @type {number}
     * @memberof Scadenza
     */
    documentoId?: number | null;
    /**
     * 
     * @type {Documento}
     * @memberof Scadenza
     */
    documento?: Documento;
    /**
     * Identificativo univoco di Amica.Scadenza.ModalitaPagamento.
     * @type {number}
     * @memberof Scadenza
     */
    modalitaPagamentoId?: number | null;
    /**
     * 
     * @type {ModalitaPagamento}
     * @memberof Scadenza
     */
    modalitaPagamento?: ModalitaPagamento;
    /**
     * Indica se la scadenza è stata impostata manualmente come 'pagata'.
     * @type {boolean}
     * @memberof Scadenza
     */
    pagataManualmente?: boolean;
    /**
     * Indica se la scadenza è pagata.
     * @type {boolean}
     * @memberof Scadenza
     */
    readonly pagata?: boolean;
    /**
     * Data di scadenza.
     * @type {Date}
     * @memberof Scadenza
     */
    data?: Date;
    /**
     * Data di pagamento.
     * @type {Date}
     * @memberof Scadenza
     */
    dataPagamento?: Date | null;
    /**
     * Data del documento fiscale.
     * @type {Date}
     * @memberof Scadenza
     */
    dataDocumento?: Date | null;
    /**
     * Importo della scadenza.
     * @type {number}
     * @memberof Scadenza
     */
    importo?: number;
    /**
     * Anno della partita aperta.
     * @type {number}
     * @memberof Scadenza
     */
    partitaAnno?: number | null;
    /**
     * Numero della partita aperta.
     * @type {number}
     * @memberof Scadenza
     */
    partitaNumero?: number | null;
    /**
     * Note.
     * @type {string}
     * @memberof Scadenza
     */
    note?: string | null;
    /**
     * Descrizione.
     * @type {string}
     * @memberof Scadenza
     */
    descrizione?: string | null;
    /**
     * Numero documento, la parte numerica (es. 99).
     * @type {number}
     * @memberof Scadenza
     */
    documentoNumeroParteNumerica?: number | null;
    /**
     * Numero documento, la parte alfanumerica (es. "bis")
     * @type {string}
     * @memberof Scadenza
     */
    documentoNumeroParteTesto?: string | null;
    /**
     * Numero documento, es. "99/bis". Il documento deve essere già salvato sul sistema.
     * @type {string}
     * @memberof Scadenza
     */
    documentoNumero?: string | null;
    /**
     * Tipo di scadenza.
     * @type {string}
     * @memberof Scadenza
     */
    tipoScadenza?: ScadenzaTipoScadenzaEnum;
    /**
     * L'importo già pagato della scadenza.
     * @type {number}
     * @memberof Scadenza
     */
    importoPagato?: number;
    /**
     * Rimanenza che risulta ancora da pagare.
     * @type {number}
     * @memberof Scadenza
     */
    readonly importoDaPagare?: number;
}


/**
 * @export
 */
export const ScadenzaTipoScadenzaEnum = {
    IncassoCliente: 'IncassoCliente',
    PagamentoCliente: 'PagamentoCliente',
    IncassoFornitore: 'IncassoFornitore',
    PagamentoFornitore: 'PagamentoFornitore'
} as const;
export type ScadenzaTipoScadenzaEnum = typeof ScadenzaTipoScadenzaEnum[keyof typeof ScadenzaTipoScadenzaEnum];


/**
 * Check if a given object implements the Scadenza interface.
 */
export function instanceOfScadenza(value: object): value is Scadenza {
    return true;
}

export function ScadenzaFromJSON(json: any): Scadenza {
    return ScadenzaFromJSONTyped(json, false);
}

export function ScadenzaFromJSONTyped(json: any, ignoreDiscriminator: boolean): Scadenza {
    if (json == null) {
        return json;
    }
    return {
        
        'id': json['id'] == null ? undefined : json['id'],
        'concurrencyToken': json['concurrencyToken'] == null ? undefined : json['concurrencyToken'],
        'registrazioneContabileId': json['registrazioneContabileId'] == null ? undefined : json['registrazioneContabileId'],
        'registrazioneContabile': json['registrazioneContabile'] == null ? undefined : RegistrazioneContabileFromJSON(json['registrazioneContabile']),
        'anagraficaId': json['anagraficaId'] == null ? undefined : json['anagraficaId'],
        'anagrafica': json['anagrafica'] == null ? undefined : AnagraficaFromJSON(json['anagrafica']),
        'documentoId': json['documentoId'] == null ? undefined : json['documentoId'],
        'documento': json['documento'] == null ? undefined : DocumentoFromJSON(json['documento']),
        'modalitaPagamentoId': json['modalitaPagamentoId'] == null ? undefined : json['modalitaPagamentoId'],
        'modalitaPagamento': json['modalitaPagamento'] == null ? undefined : ModalitaPagamentoFromJSON(json['modalitaPagamento']),
        'pagataManualmente': json['pagataManualmente'] == null ? undefined : json['pagataManualmente'],
        'pagata': json['pagata'] == null ? undefined : json['pagata'],
        'data': json['data'] == null ? undefined : (new Date(json['data'])),
        'dataPagamento': json['dataPagamento'] == null ? undefined : (new Date(json['dataPagamento'])),
        'dataDocumento': json['dataDocumento'] == null ? undefined : (new Date(json['dataDocumento'])),
        'importo': json['importo'] == null ? undefined : json['importo'],
        'partitaAnno': json['partitaAnno'] == null ? undefined : json['partitaAnno'],
        'partitaNumero': json['partitaNumero'] == null ? undefined : json['partitaNumero'],
        'note': json['note'] == null ? undefined : json['note'],
        'descrizione': json['descrizione'] == null ? undefined : json['descrizione'],
        'documentoNumeroParteNumerica': json['documentoNumeroParteNumerica'] == null ? undefined : json['documentoNumeroParteNumerica'],
        'documentoNumeroParteTesto': json['documentoNumeroParteTesto'] == null ? undefined : json['documentoNumeroParteTesto'],
        'documentoNumero': json['documentoNumero'] == null ? undefined : json['documentoNumero'],
        'tipoScadenza': json['tipoScadenza'] == null ? undefined : json['tipoScadenza'],
        'importoPagato': json['importoPagato'] == null ? undefined : json['importoPagato'],
        'importoDaPagare': json['importoDaPagare'] == null ? undefined : json['importoDaPagare'],
    };
}

export function ScadenzaToJSON(json: any): Scadenza {
    return ScadenzaToJSONTyped(json, false);
}

export function ScadenzaToJSONTyped(value?: Omit<Scadenza, 'pagata'|'importoDaPagare'> | null, ignoreDiscriminator: boolean = false): any {
    if (value == null) {
        return value;
    }

    return {
        
        'id': value['id'],
        'concurrencyToken': value['concurrencyToken'],
        'registrazioneContabileId': value['registrazioneContabileId'],
        'registrazioneContabile': RegistrazioneContabileToJSON(value['registrazioneContabile']),
        'anagraficaId': value['anagraficaId'],
        'anagrafica': AnagraficaToJSON(value['anagrafica']),
        'documentoId': value['documentoId'],
        'documento': DocumentoToJSON(value['documento']),
        'modalitaPagamentoId': value['modalitaPagamentoId'],
        'modalitaPagamento': ModalitaPagamentoToJSON(value['modalitaPagamento']),
        'pagataManualmente': value['pagataManualmente'],
        'data': value['data'] == null ? undefined : ((value['data']).toISOString()),
        'dataPagamento': value['dataPagamento'] == null ? undefined : ((value['dataPagamento'] as any).toISOString()),
        'dataDocumento': value['dataDocumento'] == null ? undefined : ((value['dataDocumento'] as any).toISOString()),
        'importo': value['importo'],
        'partitaAnno': value['partitaAnno'],
        'partitaNumero': value['partitaNumero'],
        'note': value['note'],
        'descrizione': value['descrizione'],
        'documentoNumeroParteNumerica': value['documentoNumeroParteNumerica'],
        'documentoNumeroParteTesto': value['documentoNumeroParteTesto'],
        'documentoNumero': value['documentoNumero'],
        'tipoScadenza': value['tipoScadenza'],
        'importoPagato': value['importoPagato'],
    };
}

