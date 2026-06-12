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
import type { Anagrafica } from './Anagrafica';
import {
    AnagraficaFromJSON,
    AnagraficaFromJSONTyped,
    AnagraficaToJSON,
    AnagraficaToJSONTyped,
} from './Anagrafica';
import type { CategoriaAnagrafica } from './CategoriaAnagrafica';
import {
    CategoriaAnagraficaFromJSON,
    CategoriaAnagraficaFromJSONTyped,
    CategoriaAnagraficaToJSON,
    CategoriaAnagraficaToJSONTyped,
} from './CategoriaAnagrafica';
import type { CausaleIva } from './CausaleIva';
import {
    CausaleIvaFromJSON,
    CausaleIvaFromJSONTyped,
    CausaleIvaToJSON,
    CausaleIvaToJSONTyped,
} from './CausaleIva';
import type { Pagamento } from './Pagamento';
import {
    PagamentoFromJSON,
    PagamentoFromJSONTyped,
    PagamentoToJSON,
    PagamentoToJSONTyped,
} from './Pagamento';
import type { Listino } from './Listino';
import {
    ListinoFromJSON,
    ListinoFromJSONTyped,
    ListinoToJSON,
    ListinoToJSONTyped,
} from './Listino';

/**
 * Impostazioni e informazioni di acquisto di un'Amica.Anagrafica.
 * @export
 * @interface SchedaFornitore
 */
export interface SchedaFornitore {
    /**
     * Identificativo univoco.
     * @type {number}
     * @memberof SchedaFornitore
     */
    id?: number;
    /**
     * Il token di concorrenza implementa il controllo di concorrenza ottimistica: a ogni operazione di aggiornamento o cancellazione il valore del token sul database viene confrontato con quello sull'entità. Se i valori coincidono, l'operazione viene eseguita; se differiscono, si assume che un altro utente abbia effettuato una scrittura nel frattempo e l'aggiornamento viene rifiutato.
     * @type {number}
     * @memberof SchedaFornitore
     */
    concurrencyToken?: number;
    /**
     * Identificativo univoco di Amica.Anagrafica.
     * @type {number}
     * @memberof SchedaFornitore
     */
    anagraficaId?: number | null;
    /**
     * Identificativo univoco di Amica.SchedaFornitore.Pagamento.
     * @type {number}
     * @memberof SchedaFornitore
     */
    pagamentoId?: number | null;
    /**
     * 
     * @type {Pagamento}
     * @memberof SchedaFornitore
     */
    pagamento?: Pagamento;
    /**
     * Identificativo univoco di Amica.SchedaFornitore.Listino.
     * @type {number}
     * @memberof SchedaFornitore
     */
    listinoId?: number | null;
    /**
     * 
     * @type {Listino}
     * @memberof SchedaFornitore
     */
    listino?: Listino;
    /**
     * Identificativo univoco di Amica.SchedaFornitore.CapoArea.
     * @type {number}
     * @memberof SchedaFornitore
     */
    capoAreaId?: number | null;
    /**
     * 
     * @type {Anagrafica}
     * @memberof SchedaFornitore
     */
    capoArea?: Anagrafica;
    /**
     * Identificativo univoco di Amica.SchedaFornitore.CategoriaAnagrafica.
     * @type {number}
     * @memberof SchedaFornitore
     */
    categoriaAnagraficaId?: number | null;
    /**
     * 
     * @type {CategoriaAnagrafica}
     * @memberof SchedaFornitore
     */
    categoriaAnagrafica?: CategoriaAnagrafica;
    /**
     * Identificativo univoco di Amica.SchedaFornitore.CausaleIva.
     * @type {number}
     * @memberof SchedaFornitore
     */
    causaleIvaId?: number | null;
    /**
     * 
     * @type {CausaleIva}
     * @memberof SchedaFornitore
     */
    causaleIva?: CausaleIva;
    /**
     * Fatturato realizzato nell'anno corrente.
     * @type {number}
     * @memberof SchedaFornitore
     */
    fatturatoAnnoCorrente?: number;
    /**
     * Numero di fatture ricevute nell'anno corrente.
     * @type {number}
     * @memberof SchedaFornitore
     */
    numeroFattureAnnoCorrente?: number;
    /**
     * Importo insoluto nell'anno corrente.
     * @type {number}
     * @memberof SchedaFornitore
     */
    insolutiAnnoCorrente?: number;
    /**
     * Numero di insoluti nell'anno corrente.
     * @type {number}
     * @memberof SchedaFornitore
     */
    numeroInsolutiAnnoCorrente?: number;
    /**
     * Fatturato realizzato nell'anno precedente.
     * @type {number}
     * @memberof SchedaFornitore
     */
    fatturatoAnnoPrecedente?: number;
    /**
     * Numero di fatture emesse nell'anno precedente.
     * @type {number}
     * @memberof SchedaFornitore
     */
    numeroFattureAnnoPrecedente?: number;
    /**
     * Importo insoluto nell'anno precedente.
     * @type {number}
     * @memberof SchedaFornitore
     */
    insolutiAnnoPrecedente?: number;
    /**
     * Numero di insoluti verificatisi nell'anno precedente.
     * @type {number}
     * @memberof SchedaFornitore
     */
    numeroInsolutiAnnoPrecedente?: number;
    /**
     * Data dell'ultima fattura.
     * @type {Date}
     * @memberof SchedaFornitore
     */
    dataUltimaFattura?: Date | null;
    /**
     * Data dell'ultimo pagamento.
     * @type {Date}
     * @memberof SchedaFornitore
     */
    dataUltimoPagamento?: Date | null;
    /**
     * Data dell'ultimo insoluto.
     * @type {Date}
     * @memberof SchedaFornitore
     */
    dataUltimoInsoluto?: Date | null;
    /**
     * Numero di conto, in formato grezzo (es. "  100   20"). Sono ammessi fino a cinque livelli.
     * @type {string}
     * @memberof SchedaFornitore
     */
    contoRaw?: string | null;
    /**
     * Numero di conto, in formato leggibile (es. "100.20").
     * @type {string}
     * @memberof SchedaFornitore
     */
    readonly conto?: string | null;
    /**
     * Numero di iscrizione a ruolo.
     * @type {string}
     * @memberof SchedaFornitore
     */
    iscrizioneRuolo?: string | null;
    /**
     * Numero di registrazione Enasarco.
     * @type {string}
     * @memberof SchedaFornitore
     */
    enasarco?: string | null;
}

/**
 * Check if a given object implements the SchedaFornitore interface.
 */
export function instanceOfSchedaFornitore(value: object): value is SchedaFornitore {
    return true;
}

export function SchedaFornitoreFromJSON(json: any): SchedaFornitore {
    return SchedaFornitoreFromJSONTyped(json, false);
}

export function SchedaFornitoreFromJSONTyped(json: any, ignoreDiscriminator: boolean): SchedaFornitore {
    if (json == null) {
        return json;
    }
    return {
        
        'id': json['id'] == null ? undefined : json['id'],
        'concurrencyToken': json['concurrencyToken'] == null ? undefined : json['concurrencyToken'],
        'anagraficaId': json['anagraficaId'] == null ? undefined : json['anagraficaId'],
        'pagamentoId': json['pagamentoId'] == null ? undefined : json['pagamentoId'],
        'pagamento': json['pagamento'] == null ? undefined : PagamentoFromJSON(json['pagamento']),
        'listinoId': json['listinoId'] == null ? undefined : json['listinoId'],
        'listino': json['listino'] == null ? undefined : ListinoFromJSON(json['listino']),
        'capoAreaId': json['capoAreaId'] == null ? undefined : json['capoAreaId'],
        'capoArea': json['capoArea'] == null ? undefined : AnagraficaFromJSON(json['capoArea']),
        'categoriaAnagraficaId': json['categoriaAnagraficaId'] == null ? undefined : json['categoriaAnagraficaId'],
        'categoriaAnagrafica': json['categoriaAnagrafica'] == null ? undefined : CategoriaAnagraficaFromJSON(json['categoriaAnagrafica']),
        'causaleIvaId': json['causaleIvaId'] == null ? undefined : json['causaleIvaId'],
        'causaleIva': json['causaleIva'] == null ? undefined : CausaleIvaFromJSON(json['causaleIva']),
        'fatturatoAnnoCorrente': json['fatturatoAnnoCorrente'] == null ? undefined : json['fatturatoAnnoCorrente'],
        'numeroFattureAnnoCorrente': json['numeroFattureAnnoCorrente'] == null ? undefined : json['numeroFattureAnnoCorrente'],
        'insolutiAnnoCorrente': json['insolutiAnnoCorrente'] == null ? undefined : json['insolutiAnnoCorrente'],
        'numeroInsolutiAnnoCorrente': json['numeroInsolutiAnnoCorrente'] == null ? undefined : json['numeroInsolutiAnnoCorrente'],
        'fatturatoAnnoPrecedente': json['fatturatoAnnoPrecedente'] == null ? undefined : json['fatturatoAnnoPrecedente'],
        'numeroFattureAnnoPrecedente': json['numeroFattureAnnoPrecedente'] == null ? undefined : json['numeroFattureAnnoPrecedente'],
        'insolutiAnnoPrecedente': json['insolutiAnnoPrecedente'] == null ? undefined : json['insolutiAnnoPrecedente'],
        'numeroInsolutiAnnoPrecedente': json['numeroInsolutiAnnoPrecedente'] == null ? undefined : json['numeroInsolutiAnnoPrecedente'],
        'dataUltimaFattura': json['dataUltimaFattura'] == null ? undefined : (new Date(json['dataUltimaFattura'])),
        'dataUltimoPagamento': json['dataUltimoPagamento'] == null ? undefined : (new Date(json['dataUltimoPagamento'])),
        'dataUltimoInsoluto': json['dataUltimoInsoluto'] == null ? undefined : (new Date(json['dataUltimoInsoluto'])),
        'contoRaw': json['contoRaw'] == null ? undefined : json['contoRaw'],
        'conto': json['conto'] == null ? undefined : json['conto'],
        'iscrizioneRuolo': json['iscrizioneRuolo'] == null ? undefined : json['iscrizioneRuolo'],
        'enasarco': json['enasarco'] == null ? undefined : json['enasarco'],
    };
}

export function SchedaFornitoreToJSON(json: any): SchedaFornitore {
    return SchedaFornitoreToJSONTyped(json, false);
}

export function SchedaFornitoreToJSONTyped(value?: Omit<SchedaFornitore, 'conto'> | null, ignoreDiscriminator: boolean = false): any {
    if (value == null) {
        return value;
    }

    return {
        
        'id': value['id'],
        'concurrencyToken': value['concurrencyToken'],
        'anagraficaId': value['anagraficaId'],
        'pagamentoId': value['pagamentoId'],
        'pagamento': PagamentoToJSON(value['pagamento']),
        'listinoId': value['listinoId'],
        'listino': ListinoToJSON(value['listino']),
        'capoAreaId': value['capoAreaId'],
        'capoArea': AnagraficaToJSON(value['capoArea']),
        'categoriaAnagraficaId': value['categoriaAnagraficaId'],
        'categoriaAnagrafica': CategoriaAnagraficaToJSON(value['categoriaAnagrafica']),
        'causaleIvaId': value['causaleIvaId'],
        'causaleIva': CausaleIvaToJSON(value['causaleIva']),
        'fatturatoAnnoCorrente': value['fatturatoAnnoCorrente'],
        'numeroFattureAnnoCorrente': value['numeroFattureAnnoCorrente'],
        'insolutiAnnoCorrente': value['insolutiAnnoCorrente'],
        'numeroInsolutiAnnoCorrente': value['numeroInsolutiAnnoCorrente'],
        'fatturatoAnnoPrecedente': value['fatturatoAnnoPrecedente'],
        'numeroFattureAnnoPrecedente': value['numeroFattureAnnoPrecedente'],
        'insolutiAnnoPrecedente': value['insolutiAnnoPrecedente'],
        'numeroInsolutiAnnoPrecedente': value['numeroInsolutiAnnoPrecedente'],
        'dataUltimaFattura': value['dataUltimaFattura'] == null ? undefined : ((value['dataUltimaFattura'] as any).toISOString()),
        'dataUltimoPagamento': value['dataUltimoPagamento'] == null ? undefined : ((value['dataUltimoPagamento'] as any).toISOString()),
        'dataUltimoInsoluto': value['dataUltimoInsoluto'] == null ? undefined : ((value['dataUltimoInsoluto'] as any).toISOString()),
        'contoRaw': value['contoRaw'],
        'iscrizioneRuolo': value['iscrizioneRuolo'],
        'enasarco': value['enasarco'],
    };
}

