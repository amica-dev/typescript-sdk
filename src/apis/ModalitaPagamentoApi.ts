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


import * as runtime from '../runtime';
import type {
  DistinctPropertyGroup,
  ModalitaPagamento,
  ProblemDetails,
} from '../models/index';
import {
    DistinctPropertyGroupFromJSON,
    DistinctPropertyGroupToJSON,
    ModalitaPagamentoFromJSON,
    ModalitaPagamentoToJSON,
    ProblemDetailsFromJSON,
    ProblemDetailsToJSON,
} from '../models/index';

export interface ApiVversionCompanyIdModalitaPagamentoDistinctGetRequest {
    version: string;
    companyId: string;
    selector: string;
    skip?: number;
    take?: number;
}

export interface ApiVversionCompanyIdModalitaPagamentoGetRequest {
    version: string;
    companyId: string;
    skip?: number;
    take?: number;
    skipTotalCount?: boolean;
    filter?: string;
    order?: string;
    expand?: Array<string>;
}

export interface ApiVversionCompanyIdModalitaPagamentoIdDeleteRequest {
    version: string;
    companyId: string;
    id: number;
}

export interface ApiVversionCompanyIdModalitaPagamentoIdGetRequest {
    version: string;
    companyId: string;
    id: number;
    expand?: Array<string>;
}

export interface ApiVversionCompanyIdModalitaPagamentoIdPutRequest {
    version: string;
    companyId: string;
    id: number;
    validationOverride?: boolean;
    modalitaPagamento?: ModalitaPagamento;
}

export interface ApiVversionCompanyIdModalitaPagamentoNewGetRequest {
    version: string;
    companyId: string;
}

export interface ApiVversionCompanyIdModalitaPagamentoPostRequest {
    version: string;
    companyId: string;
    validationOverride?: boolean;
    modalitaPagamento?: ModalitaPagamento;
}

/**
 * 
 */
export class ModalitaPagamentoApi extends runtime.BaseAPI {

    /**
     * Restituisce una lista di elementi distinti.
     */
    async apiVversionCompanyIdModalitaPagamentoDistinctGetRaw(requestParameters: ApiVversionCompanyIdModalitaPagamentoDistinctGetRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<Array<DistinctPropertyGroup>>> {
        if (requestParameters['version'] == null) {
            throw new runtime.RequiredError(
                'version',
                'Required parameter "version" was null or undefined when calling apiVversionCompanyIdModalitaPagamentoDistinctGet().'
            );
        }

        if (requestParameters['companyId'] == null) {
            throw new runtime.RequiredError(
                'companyId',
                'Required parameter "companyId" was null or undefined when calling apiVversionCompanyIdModalitaPagamentoDistinctGet().'
            );
        }

        if (requestParameters['selector'] == null) {
            throw new runtime.RequiredError(
                'selector',
                'Required parameter "selector" was null or undefined when calling apiVversionCompanyIdModalitaPagamentoDistinctGet().'
            );
        }

        const queryParameters: any = {};

        if (requestParameters['selector'] != null) {
            queryParameters['Selector'] = requestParameters['selector'];
        }

        if (requestParameters['skip'] != null) {
            queryParameters['Skip'] = requestParameters['skip'];
        }

        if (requestParameters['take'] != null) {
            queryParameters['Take'] = requestParameters['take'];
        }

        const headerParameters: runtime.HTTPHeaders = {};

        if (this.configuration && this.configuration.accessToken) {
            const token = this.configuration.accessToken;
            const tokenString = await token("bearer", []);

            if (tokenString) {
                headerParameters["Authorization"] = `Bearer ${tokenString}`;
            }
        }
        if (this.configuration && this.configuration.accessToken) {
            // oauth required
            headerParameters["Authorization"] = await this.configuration.accessToken("oauth2", []);
        }

        if (this.configuration && this.configuration.accessToken) {
            // oauth required
            headerParameters["Authorization"] = await this.configuration.accessToken("oauth2", []);
        }

        const response = await this.request({
            path: `/api/v{version}/{companyId}/ModalitaPagamento/distinct`.replace(`{${"version"}}`, encodeURIComponent(String(requestParameters['version']))).replace(`{${"companyId"}}`, encodeURIComponent(String(requestParameters['companyId']))),
            method: 'GET',
            headers: headerParameters,
            query: queryParameters,
        }, initOverrides);

        return new runtime.JSONApiResponse(response, (jsonValue) => jsonValue.map(DistinctPropertyGroupFromJSON));
    }

    /**
     * Restituisce una lista di elementi distinti.
     */
    async apiVversionCompanyIdModalitaPagamentoDistinctGet(requestParameters: ApiVversionCompanyIdModalitaPagamentoDistinctGetRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<Array<DistinctPropertyGroup>> {
        const response = await this.apiVversionCompanyIdModalitaPagamentoDistinctGetRaw(requestParameters, initOverrides);
        return await response.value();
    }

    /**
     *  La risposta include due header con informazioni sui risultati.  `X-Read-TotalCount` indica il numero di elementi che soddisfano il filtro impostato nella query;  `X-Read-Count` indica il numero di elementi effettivamente contenuti nella risposta.  I due header possono riportare valori diversi quando i parametri `Take` e `Skip` sono stati usati nelle opzioni di query.
     * Restituisce una lista di elementi.
     */
    async apiVversionCompanyIdModalitaPagamentoGetRaw(requestParameters: ApiVversionCompanyIdModalitaPagamentoGetRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<Array<ModalitaPagamento>>> {
        if (requestParameters['version'] == null) {
            throw new runtime.RequiredError(
                'version',
                'Required parameter "version" was null or undefined when calling apiVversionCompanyIdModalitaPagamentoGet().'
            );
        }

        if (requestParameters['companyId'] == null) {
            throw new runtime.RequiredError(
                'companyId',
                'Required parameter "companyId" was null or undefined when calling apiVversionCompanyIdModalitaPagamentoGet().'
            );
        }

        const queryParameters: any = {};

        if (requestParameters['skip'] != null) {
            queryParameters['Skip'] = requestParameters['skip'];
        }

        if (requestParameters['take'] != null) {
            queryParameters['Take'] = requestParameters['take'];
        }

        if (requestParameters['skipTotalCount'] != null) {
            queryParameters['SkipTotalCount'] = requestParameters['skipTotalCount'];
        }

        if (requestParameters['filter'] != null) {
            queryParameters['Filter'] = requestParameters['filter'];
        }

        if (requestParameters['order'] != null) {
            queryParameters['Order'] = requestParameters['order'];
        }

        if (requestParameters['expand'] != null) {
            queryParameters['Expand'] = requestParameters['expand'];
        }

        const headerParameters: runtime.HTTPHeaders = {};

        if (this.configuration && this.configuration.accessToken) {
            const token = this.configuration.accessToken;
            const tokenString = await token("bearer", []);

            if (tokenString) {
                headerParameters["Authorization"] = `Bearer ${tokenString}`;
            }
        }
        if (this.configuration && this.configuration.accessToken) {
            // oauth required
            headerParameters["Authorization"] = await this.configuration.accessToken("oauth2", []);
        }

        if (this.configuration && this.configuration.accessToken) {
            // oauth required
            headerParameters["Authorization"] = await this.configuration.accessToken("oauth2", []);
        }

        const response = await this.request({
            path: `/api/v{version}/{companyId}/ModalitaPagamento`.replace(`{${"version"}}`, encodeURIComponent(String(requestParameters['version']))).replace(`{${"companyId"}}`, encodeURIComponent(String(requestParameters['companyId']))),
            method: 'GET',
            headers: headerParameters,
            query: queryParameters,
        }, initOverrides);

        return new runtime.JSONApiResponse(response, (jsonValue) => jsonValue.map(ModalitaPagamentoFromJSON));
    }

    /**
     *  La risposta include due header con informazioni sui risultati.  `X-Read-TotalCount` indica il numero di elementi che soddisfano il filtro impostato nella query;  `X-Read-Count` indica il numero di elementi effettivamente contenuti nella risposta.  I due header possono riportare valori diversi quando i parametri `Take` e `Skip` sono stati usati nelle opzioni di query.
     * Restituisce una lista di elementi.
     */
    async apiVversionCompanyIdModalitaPagamentoGet(requestParameters: ApiVversionCompanyIdModalitaPagamentoGetRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<Array<ModalitaPagamento>> {
        const response = await this.apiVversionCompanyIdModalitaPagamentoGetRaw(requestParameters, initOverrides);
        return await response.value();
    }

    /**
     * Elimina un elemento.
     */
    async apiVversionCompanyIdModalitaPagamentoIdDeleteRaw(requestParameters: ApiVversionCompanyIdModalitaPagamentoIdDeleteRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<ModalitaPagamento>> {
        if (requestParameters['version'] == null) {
            throw new runtime.RequiredError(
                'version',
                'Required parameter "version" was null or undefined when calling apiVversionCompanyIdModalitaPagamentoIdDelete().'
            );
        }

        if (requestParameters['companyId'] == null) {
            throw new runtime.RequiredError(
                'companyId',
                'Required parameter "companyId" was null or undefined when calling apiVversionCompanyIdModalitaPagamentoIdDelete().'
            );
        }

        if (requestParameters['id'] == null) {
            throw new runtime.RequiredError(
                'id',
                'Required parameter "id" was null or undefined when calling apiVversionCompanyIdModalitaPagamentoIdDelete().'
            );
        }

        const queryParameters: any = {};

        const headerParameters: runtime.HTTPHeaders = {};

        if (this.configuration && this.configuration.accessToken) {
            const token = this.configuration.accessToken;
            const tokenString = await token("bearer", []);

            if (tokenString) {
                headerParameters["Authorization"] = `Bearer ${tokenString}`;
            }
        }
        if (this.configuration && this.configuration.accessToken) {
            // oauth required
            headerParameters["Authorization"] = await this.configuration.accessToken("oauth2", []);
        }

        if (this.configuration && this.configuration.accessToken) {
            // oauth required
            headerParameters["Authorization"] = await this.configuration.accessToken("oauth2", []);
        }

        const response = await this.request({
            path: `/api/v{version}/{companyId}/ModalitaPagamento/{id}`.replace(`{${"version"}}`, encodeURIComponent(String(requestParameters['version']))).replace(`{${"companyId"}}`, encodeURIComponent(String(requestParameters['companyId']))).replace(`{${"id"}}`, encodeURIComponent(String(requestParameters['id']))),
            method: 'DELETE',
            headers: headerParameters,
            query: queryParameters,
        }, initOverrides);

        return new runtime.JSONApiResponse(response, (jsonValue) => ModalitaPagamentoFromJSON(jsonValue));
    }

    /**
     * Elimina un elemento.
     */
    async apiVversionCompanyIdModalitaPagamentoIdDelete(requestParameters: ApiVversionCompanyIdModalitaPagamentoIdDeleteRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<ModalitaPagamento> {
        const response = await this.apiVversionCompanyIdModalitaPagamentoIdDeleteRaw(requestParameters, initOverrides);
        return await response.value();
    }

    /**
     * Restituisce un elemento.
     */
    async apiVversionCompanyIdModalitaPagamentoIdGetRaw(requestParameters: ApiVversionCompanyIdModalitaPagamentoIdGetRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<ModalitaPagamento>> {
        if (requestParameters['version'] == null) {
            throw new runtime.RequiredError(
                'version',
                'Required parameter "version" was null or undefined when calling apiVversionCompanyIdModalitaPagamentoIdGet().'
            );
        }

        if (requestParameters['companyId'] == null) {
            throw new runtime.RequiredError(
                'companyId',
                'Required parameter "companyId" was null or undefined when calling apiVversionCompanyIdModalitaPagamentoIdGet().'
            );
        }

        if (requestParameters['id'] == null) {
            throw new runtime.RequiredError(
                'id',
                'Required parameter "id" was null or undefined when calling apiVversionCompanyIdModalitaPagamentoIdGet().'
            );
        }

        const queryParameters: any = {};

        if (requestParameters['expand'] != null) {
            queryParameters['Expand'] = requestParameters['expand'];
        }

        const headerParameters: runtime.HTTPHeaders = {};

        if (this.configuration && this.configuration.accessToken) {
            const token = this.configuration.accessToken;
            const tokenString = await token("bearer", []);

            if (tokenString) {
                headerParameters["Authorization"] = `Bearer ${tokenString}`;
            }
        }
        if (this.configuration && this.configuration.accessToken) {
            // oauth required
            headerParameters["Authorization"] = await this.configuration.accessToken("oauth2", []);
        }

        if (this.configuration && this.configuration.accessToken) {
            // oauth required
            headerParameters["Authorization"] = await this.configuration.accessToken("oauth2", []);
        }

        const response = await this.request({
            path: `/api/v{version}/{companyId}/ModalitaPagamento/{id}`.replace(`{${"version"}}`, encodeURIComponent(String(requestParameters['version']))).replace(`{${"companyId"}}`, encodeURIComponent(String(requestParameters['companyId']))).replace(`{${"id"}}`, encodeURIComponent(String(requestParameters['id']))),
            method: 'GET',
            headers: headerParameters,
            query: queryParameters,
        }, initOverrides);

        return new runtime.JSONApiResponse(response, (jsonValue) => ModalitaPagamentoFromJSON(jsonValue));
    }

    /**
     * Restituisce un elemento.
     */
    async apiVversionCompanyIdModalitaPagamentoIdGet(requestParameters: ApiVversionCompanyIdModalitaPagamentoIdGetRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<ModalitaPagamento> {
        const response = await this.apiVversionCompanyIdModalitaPagamentoIdGetRaw(requestParameters, initOverrides);
        return await response.value();
    }

    /**
     * Aggiorna un elemento esistente.
     */
    async apiVversionCompanyIdModalitaPagamentoIdPutRaw(requestParameters: ApiVversionCompanyIdModalitaPagamentoIdPutRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<ModalitaPagamento>> {
        if (requestParameters['version'] == null) {
            throw new runtime.RequiredError(
                'version',
                'Required parameter "version" was null or undefined when calling apiVversionCompanyIdModalitaPagamentoIdPut().'
            );
        }

        if (requestParameters['companyId'] == null) {
            throw new runtime.RequiredError(
                'companyId',
                'Required parameter "companyId" was null or undefined when calling apiVversionCompanyIdModalitaPagamentoIdPut().'
            );
        }

        if (requestParameters['id'] == null) {
            throw new runtime.RequiredError(
                'id',
                'Required parameter "id" was null or undefined when calling apiVversionCompanyIdModalitaPagamentoIdPut().'
            );
        }

        const queryParameters: any = {};

        if (requestParameters['validationOverride'] != null) {
            queryParameters['validationOverride'] = requestParameters['validationOverride'];
        }

        const headerParameters: runtime.HTTPHeaders = {};

        headerParameters['Content-Type'] = 'application/json';

        if (this.configuration && this.configuration.accessToken) {
            const token = this.configuration.accessToken;
            const tokenString = await token("bearer", []);

            if (tokenString) {
                headerParameters["Authorization"] = `Bearer ${tokenString}`;
            }
        }
        if (this.configuration && this.configuration.accessToken) {
            // oauth required
            headerParameters["Authorization"] = await this.configuration.accessToken("oauth2", []);
        }

        if (this.configuration && this.configuration.accessToken) {
            // oauth required
            headerParameters["Authorization"] = await this.configuration.accessToken("oauth2", []);
        }

        const response = await this.request({
            path: `/api/v{version}/{companyId}/ModalitaPagamento/{id}`.replace(`{${"version"}}`, encodeURIComponent(String(requestParameters['version']))).replace(`{${"companyId"}}`, encodeURIComponent(String(requestParameters['companyId']))).replace(`{${"id"}}`, encodeURIComponent(String(requestParameters['id']))),
            method: 'PUT',
            headers: headerParameters,
            query: queryParameters,
            body: ModalitaPagamentoToJSON(requestParameters['modalitaPagamento']),
        }, initOverrides);

        return new runtime.JSONApiResponse(response, (jsonValue) => ModalitaPagamentoFromJSON(jsonValue));
    }

    /**
     * Aggiorna un elemento esistente.
     */
    async apiVversionCompanyIdModalitaPagamentoIdPut(requestParameters: ApiVversionCompanyIdModalitaPagamentoIdPutRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<ModalitaPagamento> {
        const response = await this.apiVversionCompanyIdModalitaPagamentoIdPutRaw(requestParameters, initOverrides);
        return await response.value();
    }

    /**
     * Restituisce una nuova istanza di un oggetto. Dove necessario, i valori delle proprietà saranno coerenti con lo stato e la logica dell\'applicazione (ad es., una nuova istanza di Amica.Documento avrà il Amica.Documento.Numero appropriato, basato sui documenti preesistenti di tipo compatibile).
     */
    async apiVversionCompanyIdModalitaPagamentoNewGetRaw(requestParameters: ApiVversionCompanyIdModalitaPagamentoNewGetRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<ModalitaPagamento>> {
        if (requestParameters['version'] == null) {
            throw new runtime.RequiredError(
                'version',
                'Required parameter "version" was null or undefined when calling apiVversionCompanyIdModalitaPagamentoNewGet().'
            );
        }

        if (requestParameters['companyId'] == null) {
            throw new runtime.RequiredError(
                'companyId',
                'Required parameter "companyId" was null or undefined when calling apiVversionCompanyIdModalitaPagamentoNewGet().'
            );
        }

        const queryParameters: any = {};

        const headerParameters: runtime.HTTPHeaders = {};

        if (this.configuration && this.configuration.accessToken) {
            const token = this.configuration.accessToken;
            const tokenString = await token("bearer", []);

            if (tokenString) {
                headerParameters["Authorization"] = `Bearer ${tokenString}`;
            }
        }
        if (this.configuration && this.configuration.accessToken) {
            // oauth required
            headerParameters["Authorization"] = await this.configuration.accessToken("oauth2", []);
        }

        if (this.configuration && this.configuration.accessToken) {
            // oauth required
            headerParameters["Authorization"] = await this.configuration.accessToken("oauth2", []);
        }

        const response = await this.request({
            path: `/api/v{version}/{companyId}/ModalitaPagamento/new`.replace(`{${"version"}}`, encodeURIComponent(String(requestParameters['version']))).replace(`{${"companyId"}}`, encodeURIComponent(String(requestParameters['companyId']))),
            method: 'GET',
            headers: headerParameters,
            query: queryParameters,
        }, initOverrides);

        return new runtime.JSONApiResponse(response, (jsonValue) => ModalitaPagamentoFromJSON(jsonValue));
    }

    /**
     * Restituisce una nuova istanza di un oggetto. Dove necessario, i valori delle proprietà saranno coerenti con lo stato e la logica dell\'applicazione (ad es., una nuova istanza di Amica.Documento avrà il Amica.Documento.Numero appropriato, basato sui documenti preesistenti di tipo compatibile).
     */
    async apiVversionCompanyIdModalitaPagamentoNewGet(requestParameters: ApiVversionCompanyIdModalitaPagamentoNewGetRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<ModalitaPagamento> {
        const response = await this.apiVversionCompanyIdModalitaPagamentoNewGetRaw(requestParameters, initOverrides);
        return await response.value();
    }

    /**
     * Salva un nuovo elemento.
     */
    async apiVversionCompanyIdModalitaPagamentoPostRaw(requestParameters: ApiVversionCompanyIdModalitaPagamentoPostRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<ModalitaPagamento>> {
        if (requestParameters['version'] == null) {
            throw new runtime.RequiredError(
                'version',
                'Required parameter "version" was null or undefined when calling apiVversionCompanyIdModalitaPagamentoPost().'
            );
        }

        if (requestParameters['companyId'] == null) {
            throw new runtime.RequiredError(
                'companyId',
                'Required parameter "companyId" was null or undefined when calling apiVversionCompanyIdModalitaPagamentoPost().'
            );
        }

        const queryParameters: any = {};

        if (requestParameters['validationOverride'] != null) {
            queryParameters['validationOverride'] = requestParameters['validationOverride'];
        }

        const headerParameters: runtime.HTTPHeaders = {};

        headerParameters['Content-Type'] = 'application/json';

        if (this.configuration && this.configuration.accessToken) {
            const token = this.configuration.accessToken;
            const tokenString = await token("bearer", []);

            if (tokenString) {
                headerParameters["Authorization"] = `Bearer ${tokenString}`;
            }
        }
        if (this.configuration && this.configuration.accessToken) {
            // oauth required
            headerParameters["Authorization"] = await this.configuration.accessToken("oauth2", []);
        }

        if (this.configuration && this.configuration.accessToken) {
            // oauth required
            headerParameters["Authorization"] = await this.configuration.accessToken("oauth2", []);
        }

        const response = await this.request({
            path: `/api/v{version}/{companyId}/ModalitaPagamento`.replace(`{${"version"}}`, encodeURIComponent(String(requestParameters['version']))).replace(`{${"companyId"}}`, encodeURIComponent(String(requestParameters['companyId']))),
            method: 'POST',
            headers: headerParameters,
            query: queryParameters,
            body: ModalitaPagamentoToJSON(requestParameters['modalitaPagamento']),
        }, initOverrides);

        return new runtime.JSONApiResponse(response, (jsonValue) => ModalitaPagamentoFromJSON(jsonValue));
    }

    /**
     * Salva un nuovo elemento.
     */
    async apiVversionCompanyIdModalitaPagamentoPost(requestParameters: ApiVversionCompanyIdModalitaPagamentoPostRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<ModalitaPagamento> {
        const response = await this.apiVversionCompanyIdModalitaPagamentoPostRaw(requestParameters, initOverrides);
        return await response.value();
    }

}
