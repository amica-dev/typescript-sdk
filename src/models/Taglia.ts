/* tslint:disable */
/* eslint-disable */
/**
 * Customers API
 * La Customers API fornisce accesso programmatico a tutti i dati aziendali gestiti da [Amica 20](https://gestionaleamica.com). Supporta il ciclo completo di documenti, fatture, magazzino, contabilità e anagrafiche. Per guide e documentazione completa, visitare [amica.dev](https://amica.dev/).  ## Autenticazione  Tutte le richieste API richiedono un token OAuth 2.0 Bearer valido, da includere nell\'header `Authorization`:  ``` Authorization: Bearer <token> ```  ### Registra la tua app  Per integrare la Customers API registra la tua applicazione sull\'**App Store di Amica**. Al termine della registrazione ottieni una coppia di credenziali OAuth 2.0 — `client_id` e `client_secret` (il secret è mostrato **una sola volta**) — e scegli gli **scope** e il **flusso di autenticazione** desiderati.  ### Scegli il flusso  - **Authorization Code con PKCE** (consigliato per app che operano per conto di un utente Amica): l\'utente autorizza la tua app tramite la pagina di consenso dell\'identity provider; la tua app riceve un `code` da scambiare con un access token.    ```   GET  {identity-provider}/connect/authorize?response_type=code&client_id=<client_id>&redirect_uri=<redirect_uri>&scope=openid%20read%20write%20documenti&code_challenge=<challenge>&code_challenge_method=S256   POST {identity-provider}/connect/token        grant_type=authorization_code&code=<code>&code_verifier=<verifier>&client_id=<client_id>&client_secret=<client_secret>&redirect_uri=<redirect_uri>   ```  - **Client Credentials** (per integrazioni server-to-server, senza utente interattivo):    ```   POST {identity-provider}/connect/token   Content-Type: application/x-www-form-urlencoded    grant_type=client_credentials&client_id=<client_id>&client_secret=<client_secret>&scope=read write documenti contabilita   ```    > **Nota:** il flusso Client Credentials è disponibile solo per le **app private**, non per quelle pubblicate sul marketplace.  In entrambi i casi la risposta contiene l\'`access_token` (JWT con `aud: amica-cloud`) da usare nelle chiamate successive finché non scade (`expires_in`), dopodiché va richiesto un nuovo token. Ogni token contiene uno o più **scope** che determinano le aree accessibili (vedi sotto). Dalla [API Reference](https://amica.dev) è possibile incollare un access token per provare gli endpoint direttamente dal browser.  ## Scope di autorizzazione  L\'accesso agli endpoint è governato dagli scope presenti nel token OAuth:  | Scope | Descrizione | |-|-| | `comune` | Anagrafiche: contatti, indirizzi, nazioni, valute, modalità di pagamento, ecc. | | `magazzino` | Magazzino: articoli, listini, movimenti di magazzino, giacenze, distinte base. | | `contabilita` | Contabilità: registrazioni contabili, scadenze, castelletti IVA, fatture elettroniche XML. | | `documenti` | Documenti: fatture, note di credito, DDT, ordini, preventivi, proforma ed emissione. |  Una richiesta verso un endpoint non coperto dallo scope del token riceverà una risposta `403 Forbidden`.  ## Company ID  La maggior parte degli endpoint è relativa a una specifica azienda e segue il pattern:  ``` /api/v3/{companyId}/risorsa ```  Il `companyId` è l\'identificativo univoco di ciascun database aziendale. Usare l\'endpoint `GET /api/v3/config/Azienda` per ottenere l\'elenco delle aziende disponibili.  ## Paginazione  Gli endpoint che restituiscono liste supportano la paginazione tramite query parameter:  | Parametro | Descrizione | |-|-| | `Skip` | Numero di elementi da saltare dall\'inizio del set di risultati. | | `Take` | Numero di elementi da includere nella risposta. |  La risposta include due header:  | Header | Descrizione | |-|-| | `X-Read-TotalCount` | Numero totale di elementi che soddisfano il filtro corrente. | | `X-Read-Count` | Numero di elementi effettivamente restituiti nel body della risposta. |  ## Ordinamento e filtri  Gli endpoint lista accettano parametri aggiuntivi:  | Parametro | Descrizione | |-|-| | `Order` | Lista di proprietà per l\'ordinamento, separate da virgola. Un segno meno (`-`) prima del nome indica ordine discendente. Es. `-RagioneSociale1,Citta`. | | `Filter` | Condizioni di ricerca: lista di espressioni separate da virgola, ciascuna formata da nome campo, operatore, valore ed eventuale connettore logico. Operatori: `$eq`, `$ne`, `$gt`, `$lt`, `$lte`, `$gte`, `$ct` (contiene), `$nct`, `$sw` (inizia con), `$ew` (finisce con). Connettori: `$and` (default, omissibile) e `$or`; le sotto-query si racchiudono tra `[]`. Es. `RagioneSociale1 $ct acme $or, Fido $gt 1000`. | | `SkipTotalCount` | Se `true`, l\'header `X-Read-TotalCount` viene omesso dalla risposta: migliori prestazioni a scapito del conteggio totale. Default `false`. |  ## Espansione oggetti correlati  Gli endpoint singoli e lista supportano il parametro `Expand`. Quando fornito, gli oggetti correlati vengono inclusi inline nella risposta anziché restituiti come riferimenti. È possibile specificare espansioni multiple separate da virgola.  ## Gestione errori  L\'API usa codici di stato HTTP standard e restituisce [RFC 7807](https://tools.ietf.org/html/rfc7807) Problem Details in caso di errore:  | Codice | Significato | |-|-| | `400` | Bad Request — validazione fallita o parametro obbligatorio mancante. | | `401` | Unauthorized — token mancante o scaduto. | | `403` | Forbidden — il token non possiede lo scope richiesto. | | `404` | Not Found — la risorsa richiesta non esiste. | | `409` | Conflict — conflitto di concorrenza. | | `422` | Unprocessable Entity — entità non processabile (es. token di concorrenza obsoleto). |  Alcune risposte `400` includono un campo `overridable` che indica se l\'errore di validazione può essere ignorato impostando il parametro `validationOverride` a `true`.  ## Controllo della concorrenza  Le entità contengono una proprietà `ConcurrencyToken`. Quando si aggiorna un\'entità tramite `PUT`, il token nel body della richiesta viene confrontato con il valore memorizzato. Se differiscono, viene restituito un `422 Unprocessable Entity`. Usare sempre l\'ultimo token ricevuto da una risposta `GET` o `POST`. 
 *
 * The version of the OpenAPI document: v3
 * Contact: assistenza@gestionaleamica.com
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */

import { mapValues } from '../runtime';
/**
 * Taglia.
 * @export
 * @interface Taglia
 */
export interface Taglia {
    /**
     * Identificativo univoco.
     * @type {number}
     * @memberof Taglia
     */
    id?: number;
    /**
     * Il token di concorrenza implementa il controllo di concorrenza ottimistica: a ogni operazione di aggiornamento o cancellazione il valore del token sul database viene confrontato con quello sull'entità. Se i valori coincidono, l'operazione viene eseguita; se differiscono, si assume che un altro utente abbia effettuato una scrittura nel frattempo e l'aggiornamento viene rifiutato.
     * @type {number}
     * @memberof Taglia
     */
    concurrencyToken?: number;
    /**
     * Nome.
     * @type {string}
     * @memberof Taglia
     */
    nome: string;
    /**
     * Identificativo taglia #1 (es. 'XL').
     * @type {string}
     * @memberof Taglia
     */
    taglia1?: string | null;
    /**
     * Identificativo taglia #2.
     * @type {string}
     * @memberof Taglia
     */
    taglia2?: string | null;
    /**
     * Identificativo taglia #3.
     * @type {string}
     * @memberof Taglia
     */
    taglia3?: string | null;
    /**
     * Identificativo taglia #4.
     * @type {string}
     * @memberof Taglia
     */
    taglia4?: string | null;
    /**
     * Identificativo taglia #5.
     * @type {string}
     * @memberof Taglia
     */
    taglia5?: string | null;
    /**
     * Identificativo taglia #6.
     * @type {string}
     * @memberof Taglia
     */
    taglia6?: string | null;
    /**
     * Identificativo taglia #7.
     * @type {string}
     * @memberof Taglia
     */
    taglia7?: string | null;
    /**
     * Identificativo taglia #8.
     * @type {string}
     * @memberof Taglia
     */
    taglia8?: string | null;
    /**
     * Identificativo taglia #9.
     * @type {string}
     * @memberof Taglia
     */
    taglia9?: string | null;
    /**
     * Identificativo taglia #10.
     * @type {string}
     * @memberof Taglia
     */
    taglia10?: string | null;
    /**
     * Identificativo taglia #11.
     * @type {string}
     * @memberof Taglia
     */
    taglia11?: string | null;
    /**
     * Identificativo taglia #12.
     * @type {string}
     * @memberof Taglia
     */
    taglia12?: string | null;
    /**
     * Identificativo taglia #13.
     * @type {string}
     * @memberof Taglia
     */
    taglia13?: string | null;
    /**
     * Identificativo taglia #14.
     * @type {string}
     * @memberof Taglia
     */
    taglia14?: string | null;
    /**
     * Identificativo taglia #15.
     * @type {string}
     * @memberof Taglia
     */
    taglia15?: string | null;
    /**
     * Identificativo taglia #16.
     * @type {string}
     * @memberof Taglia
     */
    taglia16?: string | null;
}

/**
 * Check if a given object implements the Taglia interface.
 */
export function instanceOfTaglia(value: object): value is Taglia {
    if (!('nome' in value) || value['nome'] === undefined) return false;
    return true;
}

export function TagliaFromJSON(json: any): Taglia {
    return TagliaFromJSONTyped(json, false);
}

export function TagliaFromJSONTyped(json: any, ignoreDiscriminator: boolean): Taglia {
    if (json == null) {
        return json;
    }
    return {
        
        'id': json['id'] == null ? undefined : json['id'],
        'concurrencyToken': json['concurrencyToken'] == null ? undefined : json['concurrencyToken'],
        'nome': json['nome'],
        'taglia1': json['taglia1'] == null ? undefined : json['taglia1'],
        'taglia2': json['taglia2'] == null ? undefined : json['taglia2'],
        'taglia3': json['taglia3'] == null ? undefined : json['taglia3'],
        'taglia4': json['taglia4'] == null ? undefined : json['taglia4'],
        'taglia5': json['taglia5'] == null ? undefined : json['taglia5'],
        'taglia6': json['taglia6'] == null ? undefined : json['taglia6'],
        'taglia7': json['taglia7'] == null ? undefined : json['taglia7'],
        'taglia8': json['taglia8'] == null ? undefined : json['taglia8'],
        'taglia9': json['taglia9'] == null ? undefined : json['taglia9'],
        'taglia10': json['taglia10'] == null ? undefined : json['taglia10'],
        'taglia11': json['taglia11'] == null ? undefined : json['taglia11'],
        'taglia12': json['taglia12'] == null ? undefined : json['taglia12'],
        'taglia13': json['taglia13'] == null ? undefined : json['taglia13'],
        'taglia14': json['taglia14'] == null ? undefined : json['taglia14'],
        'taglia15': json['taglia15'] == null ? undefined : json['taglia15'],
        'taglia16': json['taglia16'] == null ? undefined : json['taglia16'],
    };
}

export function TagliaToJSON(json: any): Taglia {
    return TagliaToJSONTyped(json, false);
}

export function TagliaToJSONTyped(value?: Taglia | null, ignoreDiscriminator: boolean = false): any {
    if (value == null) {
        return value;
    }

    return {
        
        'id': value['id'],
        'concurrencyToken': value['concurrencyToken'],
        'nome': value['nome'],
        'taglia1': value['taglia1'],
        'taglia2': value['taglia2'],
        'taglia3': value['taglia3'],
        'taglia4': value['taglia4'],
        'taglia5': value['taglia5'],
        'taglia6': value['taglia6'],
        'taglia7': value['taglia7'],
        'taglia8': value['taglia8'],
        'taglia9': value['taglia9'],
        'taglia10': value['taglia10'],
        'taglia11': value['taglia11'],
        'taglia12': value['taglia12'],
        'taglia13': value['taglia13'],
        'taglia14': value['taglia14'],
        'taglia15': value['taglia15'],
        'taglia16': value['taglia16'],
    };
}

