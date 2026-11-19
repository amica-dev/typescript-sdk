/* tslint:disable */
/* eslint-disable */
/**
 * Amica Cloud API
 * L\'Amica Cloud API fornisce accesso programmatico a tutti i dati aziendali gestiti da [Amica 20](https://gestionaleamica.com). Supporta il ciclo completo di documenti, fatture, magazzino, contabilità e anagrafiche. Per guide e documentazione completa, visitare [amica.dev](https://amica.dev/).  ## Autenticazione  Tutte le richieste API richiedono un token OAuth 2.0 Bearer valido, da includere nell\'header `Authorization`:  ``` Authorization: Bearer <token> ```  ### Registra la tua app  Per integrare l\'Amica Cloud API registra la tua applicazione sull\'[**App Store di Amica**](https://apps.amica20.it). Al termine della registrazione ottieni una coppia di credenziali OAuth 2.0 — `client_id` e `client_secret` (il secret è mostrato **una sola volta**) — e scegli gli **scope** e il **flusso di autenticazione** desiderati.  ### Scegli il flusso  La scelta dipende da **come** la tua applicazione si autentica:  - C\'è un **utente** che può accedere via browser (web app, SPA, app mobile)? → **Authorization Code con PKCE**. - È un **servizio headless** (backend, batch, integrazione server-to-server) di una **singola azienda**, senza un utente che effettua il login? → **Client Credentials**.  #### Authorization Code con PKCE  Consigliato per le app che operano per conto di un utente Amica ed è l\'**unico flusso disponibile per le app pubblicate sul marketplace**. Una sola registrazione serve un numero qualsiasi di aziende: ogni utente autorizza la tua app per la propria azienda tramite la pagina di consenso dell\'identity provider, e il token riceve automaticamente il contesto di quell\'azienda. La tua app riceve un `code` da scambiare con un access token.  ``` GET  {identity-provider}/connect/authorize?response_type=code&client_id=<client_id>&redirect_uri=<redirect_uri>&scope=openid%20read%20write%20documenti&code_challenge=<challenge>&code_challenge_method=S256 POST {identity-provider}/connect/token      grant_type=authorization_code&code=<code>&code_verifier=<verifier>&client_id=<client_id>&client_secret=<client_secret>&redirect_uri=<redirect_uri> ```  #### Client Credentials  Per integrazioni **server-to-server** senza utente interattivo. Disponibile solo per le **app private**, non per quelle pubblicate sul marketplace. Un\'app Client Credentials è **legata a una singola azienda** — quella dell\'utente che la registra — e il token ne riceve automaticamente il contesto. Per servire un\'azienda diversa serve una registrazione separata; se devi distribuire la stessa app a più aziende usa invece **Authorization Code**.  ``` POST {identity-provider}/connect/token Content-Type: application/x-www-form-urlencoded  grant_type=client_credentials&client_id=<client_id>&client_secret=<client_secret>&scope=comune read write documenti ```  > **Importante:** non includere lo scope `openid` (né `profile`/`email`) in questo flusso. `openid` attiva OpenID Connect — richiede un utente che effettua il login e l\'emissione di un ID token — cosa che un flusso server-to-server non prevede: la richiesta viene rifiutata con l\'errore `Client cannot request OpenID scopes in client credentials flow`. Indica solo gli scope di risorsa (`comune`, `magazzino`, `documenti`, `contabilita`, ed eventualmente `read`/`write`).  In entrambi i casi la risposta contiene l\'`access_token` (JWT con `aud: amica-cloud`) da usare nelle chiamate successive finché non scade (`expires_in`), dopodiché va richiesto un nuovo token. Ogni token contiene uno o più **scope** che determinano le aree accessibili (vedi sotto). Dalla [API Reference](https://amica.dev) è possibile incollare un access token per provare gli endpoint direttamente dal browser.  ## Scope di autorizzazione  L\'accesso agli endpoint è governato dagli scope presenti nel token OAuth:  | Scope | Descrizione | |-|-| | `comune` | Anagrafiche: contatti, indirizzi, nazioni, valute, modalità di pagamento, ecc. | | `magazzino` | Magazzino: articoli, listini, movimenti di magazzino, giacenze, distinte base. | | `contabilita` | Contabilità: registrazioni contabili, scadenze, castelletti IVA, fatture elettroniche XML. | | `documenti` | Documenti: fatture, note di credito, DDT, ordini, preventivi, proforma ed emissione. |  Una richiesta verso un endpoint non coperto dallo scope del token riceverà una risposta `403 Forbidden`.  ## Company ID  La maggior parte degli endpoint è relativa a una specifica azienda e segue il pattern:  ``` /api/v3/{companyId}/risorsa ```  Il `companyId` è l\'identificativo univoco di ciascun database aziendale. Usare l\'endpoint `GET /api/v3/config/Azienda` per ottenere l\'elenco delle aziende disponibili.  ## Paginazione  Gli endpoint che restituiscono liste supportano la paginazione tramite query parameter:  | Parametro | Descrizione | |-|-| | `Skip` | Numero di elementi da saltare dall\'inizio del set di risultati. | | `Take` | Numero di elementi da includere nella risposta. |  La risposta include due header:  | Header | Descrizione | |-|-| | `X-Read-TotalCount` | Numero totale di elementi che soddisfano il filtro corrente. | | `X-Read-Count` | Numero di elementi effettivamente restituiti nel body della risposta. |  ## Ordinamento e filtri  Gli endpoint lista accettano parametri aggiuntivi:  | Parametro | Descrizione | |-|-| | `Order` | Lista di proprietà per l\'ordinamento, separate da virgola. Un segno meno (`-`) prima del nome indica ordine discendente. Es. `-RagioneSociale1,Citta`. | | `Filter` | Condizioni di ricerca: lista di espressioni separate da virgola, ciascuna formata da nome campo, operatore, valore ed eventuale connettore logico. Operatori: `$eq`, `$ne`, `$gt`, `$lt`, `$lte`, `$gte`, `$ct` (contiene), `$nct`, `$sw` (inizia con), `$ew` (finisce con). Connettori: `$and` (default, omissibile) e `$or`; le sotto-query si racchiudono tra `[]`. Es. `RagioneSociale1 $ct acme $or, Fido $gt 1000`. | | `SkipTotalCount` | Se `true`, l\'header `X-Read-TotalCount` viene omesso dalla risposta: migliori prestazioni a scapito del conteggio totale. Default `false`. |  ## Espansione oggetti correlati  Gli endpoint singoli e lista supportano il parametro `Expand`. Quando fornito, gli oggetti correlati vengono inclusi inline nella risposta anziché restituiti come riferimenti. È possibile specificare espansioni multiple separate da virgola.  ## Gestione errori  L\'API usa codici di stato HTTP standard e restituisce [RFC 7807](https://tools.ietf.org/html/rfc7807) Problem Details in caso di errore:  | Codice | Significato | |-|-| | `400` | Bad Request — validazione fallita o parametro obbligatorio mancante. | | `401` | Unauthorized — token mancante o scaduto. | | `403` | Forbidden — accesso negato (vedi sotto le possibili cause). | | `404` | Not Found — la risorsa richiesta non esiste. | | `409` | Conflict — conflitto di concorrenza. | | `422` | Unprocessable Entity — entità non processabile (es. token di concorrenza obsoleto). |  Un `403` può avere tre cause; nelle ultime due il campo `code` della risposta indica quale:  - il token non possiede lo scope richiesto dall\'endpoint; - `code: cloud_not_active` — l\'account lavora con una connessione locale e la Cloud API non espone i suoi dati. Per attivare il servizio cloud contatta l\'assistenza, poi richiedi un nuovo token: lo stato del servizio è letto al rilascio del token; - `code: company_license_not_active` — la licenza dell\'azienda indicata nel percorso è scaduta o non è attiva. Le altre aziende con licenza attiva restano accessibili.  Il motivo dell\'errore è sempre nel campo `detail`. Ogni risposta di errore riporta inoltre `overridable`: quando vale `true`, l\'errore di validazione è *forzabile* e basta ripetere la stessa richiesta aggiungendo `validationOverride=true` alla query string perché il servizio la accetti. È il caso delle anomalie formali su dati reali — la partita IVA di un fornitore estero, per esempio — che il cliente ha comunque bisogno di registrare.  ## Controllo della concorrenza  Le entità contengono una proprietà `ConcurrencyToken`. Quando si aggiorna un\'entità tramite `PUT`, il token nel body della richiesta viene confrontato con il valore memorizzato. Se differiscono, viene restituito un `422 Unprocessable Entity`. Usare sempre l\'ultimo token ricevuto da una risposta `GET` o `POST`. 
 *
 * The version of the OpenAPI document: 3.3.7
 * Contact: assistenza@gestionaleamica.com
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */


import * as runtime from '../runtime';
import type {
  AllegatoDocumento,
  FatturaElettronicaExportOptions,
  FatturaElettronicaExportResult,
  FatturaElettronicaImportResult,
  FatturaElettronicaUploadOptions,
  FatturaElettronicaUploadResult,
  FatturaElettronicaXml,
  FatturaElettronicaXmlGetArchiveByDateRangeOptions,
  FatturaElettronicaXmlGetArchiveByFileNameOptions,
  FatturaElettronicaXmlStyleSheetData,
  ProblemDetails,
} from '../models/index';
import {
    AllegatoDocumentoFromJSON,
    AllegatoDocumentoToJSON,
    FatturaElettronicaExportOptionsFromJSON,
    FatturaElettronicaExportOptionsToJSON,
    FatturaElettronicaExportResultFromJSON,
    FatturaElettronicaExportResultToJSON,
    FatturaElettronicaImportResultFromJSON,
    FatturaElettronicaImportResultToJSON,
    FatturaElettronicaUploadOptionsFromJSON,
    FatturaElettronicaUploadOptionsToJSON,
    FatturaElettronicaUploadResultFromJSON,
    FatturaElettronicaUploadResultToJSON,
    FatturaElettronicaXmlFromJSON,
    FatturaElettronicaXmlToJSON,
    FatturaElettronicaXmlGetArchiveByDateRangeOptionsFromJSON,
    FatturaElettronicaXmlGetArchiveByDateRangeOptionsToJSON,
    FatturaElettronicaXmlGetArchiveByFileNameOptionsFromJSON,
    FatturaElettronicaXmlGetArchiveByFileNameOptionsToJSON,
    FatturaElettronicaXmlStyleSheetDataFromJSON,
    FatturaElettronicaXmlStyleSheetDataToJSON,
    ProblemDetailsFromJSON,
    ProblemDetailsToJSON,
} from '../models/index';

export interface FatturaElettronicaXmlApplyStyleSheetRequest {
    companyId: string;
    idempotencyKey?: string;
    fatturaElettronicaXmlStyleSheetData?: FatturaElettronicaXmlStyleSheetData;
}

export interface FatturaElettronicaXmlArchiveByDateRangeRequest {
    companyId: string;
    idempotencyKey?: string;
    fatturaElettronicaXmlGetArchiveByDateRangeOptions?: FatturaElettronicaXmlGetArchiveByDateRangeOptions;
}

export interface FatturaElettronicaXmlArchiveByFileNameRequest {
    companyId: string;
    idempotencyKey?: string;
    fatturaElettronicaXmlGetArchiveByFileNameOptions?: FatturaElettronicaXmlGetArchiveByFileNameOptions;
}

export interface FatturaElettronicaXmlBulkAddRequest {
    companyId: string;
    idempotencyKey?: string;
    file?: Blob;
}

export interface FatturaElettronicaXmlBulkDeleteRequest {
    companyId: string;
}

export interface FatturaElettronicaXmlDeleteRequest {
    companyId: string;
    id: number;
    validationOverride?: boolean;
}

export interface FatturaElettronicaXmlDownloadEsitiRequest {
    companyId: string;
    idempotencyKey?: string;
}

export interface FatturaElettronicaXmlDownloadFattureRequest {
    companyId: string;
    idempotencyKey?: string;
}

export interface FatturaElettronicaXmlExportRequest {
    companyId: string;
    validationOverride?: boolean;
    idempotencyKey?: string;
    fatturaElettronicaExportOptions?: FatturaElettronicaExportOptions;
}

export interface FatturaElettronicaXmlGetRequest {
    companyId: string;
    id: number;
    expand?: Array<string>;
}

export interface FatturaElettronicaXmlGetAllAsArchiveRequest {
    companyId: string;
}

export interface FatturaElettronicaXmlGetAsXmlRequest {
    companyId: string;
    fileName: string;
}

export interface FatturaElettronicaXmlGetAttachmentsRequest {
    companyId: string;
    fileName: string;
}

export interface FatturaElettronicaXmlImportRequest {
    companyId: string;
    idempotencyKey?: string;
    dataConsegnaSdi?: Date;
    identificativoSdi?: string;
    file?: Blob;
}

export interface FatturaElettronicaXmlListRequest {
    companyId: string;
    skip?: number;
    take?: number;
    skipTotalCount?: boolean;
    filter?: string;
    order?: string;
    expand?: Array<string>;
}

export interface FatturaElettronicaXmlNewInstanceRequest {
    companyId: string;
}

export interface FatturaElettronicaXmlPairRequest {
    companyId: string;
    idempotencyKey?: string;
    fileName?: string;
    progressivo?: string;
    documentoId?: number;
    file?: Blob;
}

export interface FatturaElettronicaXmlPostRequest {
    companyId: string;
    validationOverride?: boolean;
    idempotencyKey?: string;
    fatturaElettronicaXml?: FatturaElettronicaXml;
}

export interface FatturaElettronicaXmlPutRequest {
    companyId: string;
    id: number;
    validationOverride?: boolean;
    idempotencyKey?: string;
    fatturaElettronicaXml?: FatturaElettronicaXml;
}

export interface FatturaElettronicaXmlUploadRequest {
    companyId: string;
    idempotencyKey?: string;
    fatturaElettronicaUploadOptions?: FatturaElettronicaUploadOptions;
}

/**
 * 
 */
export class FatturaElettronicaXmlApi extends runtime.BaseAPI {

    /**
     * Applica un foglio di stile CSS a una fattura XML esistente e restituisce il risultato.
     */
    async fatturaElettronicaXmlApplyStyleSheetRaw(requestParameters: FatturaElettronicaXmlApplyStyleSheetRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<void>> {
        if (requestParameters['companyId'] == null) {
            throw new runtime.RequiredError(
                'companyId',
                'Required parameter "companyId" was null or undefined when calling fatturaElettronicaXmlApplyStyleSheet().'
            );
        }

        const queryParameters: any = {};

        const headerParameters: runtime.HTTPHeaders = {};

        headerParameters['Content-Type'] = 'application/json';

        if (requestParameters['idempotencyKey'] != null) {
            headerParameters['Idempotency-Key'] = String(requestParameters['idempotencyKey']);
        }

        if (this.configuration && this.configuration.accessToken) {
            const token = this.configuration.accessToken;
            const tokenString = await token("bearer", []);

            if (tokenString) {
                headerParameters["Authorization"] = `Bearer ${tokenString}`;
            }
        }
        if (this.configuration && this.configuration.accessToken) {
            // oauth required
            headerParameters["Authorization"] = await this.configuration.accessToken("oauth2ClientCredentials", []);
        }

        if (this.configuration && this.configuration.accessToken) {
            // oauth required
            headerParameters["Authorization"] = await this.configuration.accessToken("oauth2", []);
        }

        const response = await this.request({
            path: `/api/v3/{companyId}/FatturaElettronicaXml/stylesheet`.replace(`{${"companyId"}}`, encodeURIComponent(String(requestParameters['companyId']))),
            method: 'POST',
            headers: headerParameters,
            query: queryParameters,
            body: FatturaElettronicaXmlStyleSheetDataToJSON(requestParameters['fatturaElettronicaXmlStyleSheetData']),
        }, initOverrides);

        return new runtime.VoidApiResponse(response);
    }

    /**
     * Applica un foglio di stile CSS a una fattura XML esistente e restituisce il risultato.
     */
    async fatturaElettronicaXmlApplyStyleSheet(requestParameters: FatturaElettronicaXmlApplyStyleSheetRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<void> {
        await this.fatturaElettronicaXmlApplyStyleSheetRaw(requestParameters, initOverrides);
    }

    /**
     * Non è possibile scaricare più di 350 file alla volta.
     * Scarica un archivio ZIP di fatture XML, filtrate per intervallo di date.
     */
    async fatturaElettronicaXmlArchiveByDateRangeRaw(requestParameters: FatturaElettronicaXmlArchiveByDateRangeRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<void>> {
        if (requestParameters['companyId'] == null) {
            throw new runtime.RequiredError(
                'companyId',
                'Required parameter "companyId" was null or undefined when calling fatturaElettronicaXmlArchiveByDateRange().'
            );
        }

        const queryParameters: any = {};

        const headerParameters: runtime.HTTPHeaders = {};

        headerParameters['Content-Type'] = 'application/json';

        if (requestParameters['idempotencyKey'] != null) {
            headerParameters['Idempotency-Key'] = String(requestParameters['idempotencyKey']);
        }

        if (this.configuration && this.configuration.accessToken) {
            const token = this.configuration.accessToken;
            const tokenString = await token("bearer", []);

            if (tokenString) {
                headerParameters["Authorization"] = `Bearer ${tokenString}`;
            }
        }
        if (this.configuration && this.configuration.accessToken) {
            // oauth required
            headerParameters["Authorization"] = await this.configuration.accessToken("oauth2ClientCredentials", []);
        }

        if (this.configuration && this.configuration.accessToken) {
            // oauth required
            headerParameters["Authorization"] = await this.configuration.accessToken("oauth2", []);
        }

        const response = await this.request({
            path: `/api/v3/{companyId}/FatturaElettronicaXml/archivebydaterange`.replace(`{${"companyId"}}`, encodeURIComponent(String(requestParameters['companyId']))),
            method: 'POST',
            headers: headerParameters,
            query: queryParameters,
            body: FatturaElettronicaXmlGetArchiveByDateRangeOptionsToJSON(requestParameters['fatturaElettronicaXmlGetArchiveByDateRangeOptions']),
        }, initOverrides);

        return new runtime.VoidApiResponse(response);
    }

    /**
     * Non è possibile scaricare più di 350 file alla volta.
     * Scarica un archivio ZIP di fatture XML, filtrate per intervallo di date.
     */
    async fatturaElettronicaXmlArchiveByDateRange(requestParameters: FatturaElettronicaXmlArchiveByDateRangeRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<void> {
        await this.fatturaElettronicaXmlArchiveByDateRangeRaw(requestParameters, initOverrides);
    }

    /**
     * Non è possibile scaricare più di 350 file alla volta.
     * Scarica un archivio ZIP di fatture XML, filtrate per nome file.
     */
    async fatturaElettronicaXmlArchiveByFileNameRaw(requestParameters: FatturaElettronicaXmlArchiveByFileNameRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<void>> {
        if (requestParameters['companyId'] == null) {
            throw new runtime.RequiredError(
                'companyId',
                'Required parameter "companyId" was null or undefined when calling fatturaElettronicaXmlArchiveByFileName().'
            );
        }

        const queryParameters: any = {};

        const headerParameters: runtime.HTTPHeaders = {};

        headerParameters['Content-Type'] = 'application/json';

        if (requestParameters['idempotencyKey'] != null) {
            headerParameters['Idempotency-Key'] = String(requestParameters['idempotencyKey']);
        }

        if (this.configuration && this.configuration.accessToken) {
            const token = this.configuration.accessToken;
            const tokenString = await token("bearer", []);

            if (tokenString) {
                headerParameters["Authorization"] = `Bearer ${tokenString}`;
            }
        }
        if (this.configuration && this.configuration.accessToken) {
            // oauth required
            headerParameters["Authorization"] = await this.configuration.accessToken("oauth2ClientCredentials", []);
        }

        if (this.configuration && this.configuration.accessToken) {
            // oauth required
            headerParameters["Authorization"] = await this.configuration.accessToken("oauth2", []);
        }

        const response = await this.request({
            path: `/api/v3/{companyId}/FatturaElettronicaXml/archivebyfilename`.replace(`{${"companyId"}}`, encodeURIComponent(String(requestParameters['companyId']))),
            method: 'POST',
            headers: headerParameters,
            query: queryParameters,
            body: FatturaElettronicaXmlGetArchiveByFileNameOptionsToJSON(requestParameters['fatturaElettronicaXmlGetArchiveByFileNameOptions']),
        }, initOverrides);

        return new runtime.VoidApiResponse(response);
    }

    /**
     * Non è possibile scaricare più di 350 file alla volta.
     * Scarica un archivio ZIP di fatture XML, filtrate per nome file.
     */
    async fatturaElettronicaXmlArchiveByFileName(requestParameters: FatturaElettronicaXmlArchiveByFileNameRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<void> {
        await this.fatturaElettronicaXmlArchiveByFileNameRaw(requestParameters, initOverrides);
    }

    /**
     * Carica in blocco fatture XML da un archivio ZIP.
     */
    async fatturaElettronicaXmlBulkAddRaw(requestParameters: FatturaElettronicaXmlBulkAddRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<void>> {
        if (requestParameters['companyId'] == null) {
            throw new runtime.RequiredError(
                'companyId',
                'Required parameter "companyId" was null or undefined when calling fatturaElettronicaXmlBulkAdd().'
            );
        }

        const queryParameters: any = {};

        const headerParameters: runtime.HTTPHeaders = {};

        if (requestParameters['idempotencyKey'] != null) {
            headerParameters['Idempotency-Key'] = String(requestParameters['idempotencyKey']);
        }

        if (this.configuration && this.configuration.accessToken) {
            const token = this.configuration.accessToken;
            const tokenString = await token("bearer", []);

            if (tokenString) {
                headerParameters["Authorization"] = `Bearer ${tokenString}`;
            }
        }
        if (this.configuration && this.configuration.accessToken) {
            // oauth required
            headerParameters["Authorization"] = await this.configuration.accessToken("oauth2ClientCredentials", []);
        }

        if (this.configuration && this.configuration.accessToken) {
            // oauth required
            headerParameters["Authorization"] = await this.configuration.accessToken("oauth2", []);
        }

        const consumes: runtime.Consume[] = [
            { contentType: 'multipart/form-data' },
        ];
        // @ts-ignore: canConsumeForm may be unused
        const canConsumeForm = runtime.canConsumeForm(consumes);

        let formParams: { append(param: string, value: any): any };
        let useForm = false;
        // use FormData to transmit files using content-type "multipart/form-data"
        useForm = canConsumeForm;
        if (useForm) {
            formParams = new FormData();
        } else {
            formParams = new URLSearchParams();
        }

        if (requestParameters['file'] != null) {
            formParams.append('file', requestParameters['file'] as any);
        }

        const response = await this.request({
            path: `/api/v3/{companyId}/FatturaElettronicaXml/bulk`.replace(`{${"companyId"}}`, encodeURIComponent(String(requestParameters['companyId']))),
            method: 'POST',
            headers: headerParameters,
            query: queryParameters,
            body: formParams,
        }, initOverrides);

        return new runtime.VoidApiResponse(response);
    }

    /**
     * Carica in blocco fatture XML da un archivio ZIP.
     */
    async fatturaElettronicaXmlBulkAdd(requestParameters: FatturaElettronicaXmlBulkAddRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<void> {
        await this.fatturaElettronicaXmlBulkAddRaw(requestParameters, initOverrides);
    }

    /**
     * Elimina in blocco tutte le fatture XML dell\'azienda.
     */
    async fatturaElettronicaXmlBulkDeleteRaw(requestParameters: FatturaElettronicaXmlBulkDeleteRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<void>> {
        if (requestParameters['companyId'] == null) {
            throw new runtime.RequiredError(
                'companyId',
                'Required parameter "companyId" was null or undefined when calling fatturaElettronicaXmlBulkDelete().'
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
            headerParameters["Authorization"] = await this.configuration.accessToken("oauth2ClientCredentials", []);
        }

        if (this.configuration && this.configuration.accessToken) {
            // oauth required
            headerParameters["Authorization"] = await this.configuration.accessToken("oauth2", []);
        }

        const response = await this.request({
            path: `/api/v3/{companyId}/FatturaElettronicaXml/bulk`.replace(`{${"companyId"}}`, encodeURIComponent(String(requestParameters['companyId']))),
            method: 'DELETE',
            headers: headerParameters,
            query: queryParameters,
        }, initOverrides);

        return new runtime.VoidApiResponse(response);
    }

    /**
     * Elimina in blocco tutte le fatture XML dell\'azienda.
     */
    async fatturaElettronicaXmlBulkDelete(requestParameters: FatturaElettronicaXmlBulkDeleteRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<void> {
        await this.fatturaElettronicaXmlBulkDeleteRaw(requestParameters, initOverrides);
    }

    /**
     * Elimina un elemento.
     */
    async fatturaElettronicaXmlDeleteRaw(requestParameters: FatturaElettronicaXmlDeleteRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<FatturaElettronicaXml>> {
        if (requestParameters['companyId'] == null) {
            throw new runtime.RequiredError(
                'companyId',
                'Required parameter "companyId" was null or undefined when calling fatturaElettronicaXmlDelete().'
            );
        }

        if (requestParameters['id'] == null) {
            throw new runtime.RequiredError(
                'id',
                'Required parameter "id" was null or undefined when calling fatturaElettronicaXmlDelete().'
            );
        }

        const queryParameters: any = {};

        if (requestParameters['validationOverride'] != null) {
            queryParameters['validationOverride'] = requestParameters['validationOverride'];
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
            headerParameters["Authorization"] = await this.configuration.accessToken("oauth2ClientCredentials", []);
        }

        if (this.configuration && this.configuration.accessToken) {
            // oauth required
            headerParameters["Authorization"] = await this.configuration.accessToken("oauth2", []);
        }

        const response = await this.request({
            path: `/api/v3/{companyId}/FatturaElettronicaXml/{id}`.replace(`{${"companyId"}}`, encodeURIComponent(String(requestParameters['companyId']))).replace(`{${"id"}}`, encodeURIComponent(String(requestParameters['id']))),
            method: 'DELETE',
            headers: headerParameters,
            query: queryParameters,
        }, initOverrides);

        return new runtime.JSONApiResponse(response, (jsonValue) => FatturaElettronicaXmlFromJSON(jsonValue));
    }

    /**
     * Elimina un elemento.
     */
    async fatturaElettronicaXmlDelete(requestParameters: FatturaElettronicaXmlDeleteRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<FatturaElettronicaXml> {
        const response = await this.fatturaElettronicaXmlDeleteRaw(requestParameters, initOverrides);
        return await response.value();
    }

    /**
     * Interroga il Sistema di Interscambio (SDI) e scarica gli esiti di invio delle fatture precedentemente caricate.
     */
    async fatturaElettronicaXmlDownloadEsitiRaw(requestParameters: FatturaElettronicaXmlDownloadEsitiRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<Array<FatturaElettronicaImportResult>>> {
        if (requestParameters['companyId'] == null) {
            throw new runtime.RequiredError(
                'companyId',
                'Required parameter "companyId" was null or undefined when calling fatturaElettronicaXmlDownloadEsiti().'
            );
        }

        const queryParameters: any = {};

        const headerParameters: runtime.HTTPHeaders = {};

        if (requestParameters['idempotencyKey'] != null) {
            headerParameters['Idempotency-Key'] = String(requestParameters['idempotencyKey']);
        }

        if (this.configuration && this.configuration.accessToken) {
            const token = this.configuration.accessToken;
            const tokenString = await token("bearer", []);

            if (tokenString) {
                headerParameters["Authorization"] = `Bearer ${tokenString}`;
            }
        }
        if (this.configuration && this.configuration.accessToken) {
            // oauth required
            headerParameters["Authorization"] = await this.configuration.accessToken("oauth2ClientCredentials", []);
        }

        if (this.configuration && this.configuration.accessToken) {
            // oauth required
            headerParameters["Authorization"] = await this.configuration.accessToken("oauth2", []);
        }

        const response = await this.request({
            path: `/api/v3/{companyId}/FatturaElettronicaXml/sdi/download/esiti`.replace(`{${"companyId"}}`, encodeURIComponent(String(requestParameters['companyId']))),
            method: 'POST',
            headers: headerParameters,
            query: queryParameters,
        }, initOverrides);

        return new runtime.JSONApiResponse(response, (jsonValue) => jsonValue.map(FatturaElettronicaImportResultFromJSON));
    }

    /**
     * Interroga il Sistema di Interscambio (SDI) e scarica gli esiti di invio delle fatture precedentemente caricate.
     */
    async fatturaElettronicaXmlDownloadEsiti(requestParameters: FatturaElettronicaXmlDownloadEsitiRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<Array<FatturaElettronicaImportResult>> {
        const response = await this.fatturaElettronicaXmlDownloadEsitiRaw(requestParameters, initOverrides);
        return await response.value();
    }

    /**
     * Il <a href=\"https://gestionaleamica.com/Software/ServizioInterscambioFatture\">Servizio di Interscambio Documenti</a> deve essere attivo per l\'azienda e la relativa chiave di attivazione deve essere presente in `SdiApiKey`.
     * Scarica le nuove fatture dal Sistema di Interscambio (SDI).
     */
    async fatturaElettronicaXmlDownloadFattureRaw(requestParameters: FatturaElettronicaXmlDownloadFattureRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<Array<FatturaElettronicaImportResult>>> {
        if (requestParameters['companyId'] == null) {
            throw new runtime.RequiredError(
                'companyId',
                'Required parameter "companyId" was null or undefined when calling fatturaElettronicaXmlDownloadFatture().'
            );
        }

        const queryParameters: any = {};

        const headerParameters: runtime.HTTPHeaders = {};

        if (requestParameters['idempotencyKey'] != null) {
            headerParameters['Idempotency-Key'] = String(requestParameters['idempotencyKey']);
        }

        if (this.configuration && this.configuration.accessToken) {
            const token = this.configuration.accessToken;
            const tokenString = await token("bearer", []);

            if (tokenString) {
                headerParameters["Authorization"] = `Bearer ${tokenString}`;
            }
        }
        if (this.configuration && this.configuration.accessToken) {
            // oauth required
            headerParameters["Authorization"] = await this.configuration.accessToken("oauth2ClientCredentials", []);
        }

        if (this.configuration && this.configuration.accessToken) {
            // oauth required
            headerParameters["Authorization"] = await this.configuration.accessToken("oauth2", []);
        }

        const response = await this.request({
            path: `/api/v3/{companyId}/FatturaElettronicaXml/sdi/download/fatture`.replace(`{${"companyId"}}`, encodeURIComponent(String(requestParameters['companyId']))),
            method: 'POST',
            headers: headerParameters,
            query: queryParameters,
        }, initOverrides);

        return new runtime.JSONApiResponse(response, (jsonValue) => jsonValue.map(FatturaElettronicaImportResultFromJSON));
    }

    /**
     * Il <a href=\"https://gestionaleamica.com/Software/ServizioInterscambioFatture\">Servizio di Interscambio Documenti</a> deve essere attivo per l\'azienda e la relativa chiave di attivazione deve essere presente in `SdiApiKey`.
     * Scarica le nuove fatture dal Sistema di Interscambio (SDI).
     */
    async fatturaElettronicaXmlDownloadFatture(requestParameters: FatturaElettronicaXmlDownloadFattureRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<Array<FatturaElettronicaImportResult>> {
        const response = await this.fatturaElettronicaXmlDownloadFattureRaw(requestParameters, initOverrides);
        return await response.value();
    }

    /**
     * Tutti i documenti devono riferirsi alla stessa <a href=\"#tag/Anagrafica\">Anagrafica</a>.
     * Esporta uno o più documenti in una fattura XML.
     */
    async fatturaElettronicaXmlExportRaw(requestParameters: FatturaElettronicaXmlExportRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<FatturaElettronicaExportResult>> {
        if (requestParameters['companyId'] == null) {
            throw new runtime.RequiredError(
                'companyId',
                'Required parameter "companyId" was null or undefined when calling fatturaElettronicaXmlExport().'
            );
        }

        const queryParameters: any = {};

        if (requestParameters['validationOverride'] != null) {
            queryParameters['validationOverride'] = requestParameters['validationOverride'];
        }

        const headerParameters: runtime.HTTPHeaders = {};

        headerParameters['Content-Type'] = 'application/json';

        if (requestParameters['idempotencyKey'] != null) {
            headerParameters['Idempotency-Key'] = String(requestParameters['idempotencyKey']);
        }

        if (this.configuration && this.configuration.accessToken) {
            const token = this.configuration.accessToken;
            const tokenString = await token("bearer", []);

            if (tokenString) {
                headerParameters["Authorization"] = `Bearer ${tokenString}`;
            }
        }
        if (this.configuration && this.configuration.accessToken) {
            // oauth required
            headerParameters["Authorization"] = await this.configuration.accessToken("oauth2ClientCredentials", []);
        }

        if (this.configuration && this.configuration.accessToken) {
            // oauth required
            headerParameters["Authorization"] = await this.configuration.accessToken("oauth2", []);
        }

        const response = await this.request({
            path: `/api/v3/{companyId}/FatturaElettronicaXml/export`.replace(`{${"companyId"}}`, encodeURIComponent(String(requestParameters['companyId']))),
            method: 'POST',
            headers: headerParameters,
            query: queryParameters,
            body: FatturaElettronicaExportOptionsToJSON(requestParameters['fatturaElettronicaExportOptions']),
        }, initOverrides);

        return new runtime.JSONApiResponse(response, (jsonValue) => FatturaElettronicaExportResultFromJSON(jsonValue));
    }

    /**
     * Tutti i documenti devono riferirsi alla stessa <a href=\"#tag/Anagrafica\">Anagrafica</a>.
     * Esporta uno o più documenti in una fattura XML.
     */
    async fatturaElettronicaXmlExport(requestParameters: FatturaElettronicaXmlExportRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<FatturaElettronicaExportResult> {
        const response = await this.fatturaElettronicaXmlExportRaw(requestParameters, initOverrides);
        return await response.value();
    }

    /**
     * Restituisce un elemento.
     */
    async fatturaElettronicaXmlGetRaw(requestParameters: FatturaElettronicaXmlGetRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<FatturaElettronicaXml>> {
        if (requestParameters['companyId'] == null) {
            throw new runtime.RequiredError(
                'companyId',
                'Required parameter "companyId" was null or undefined when calling fatturaElettronicaXmlGet().'
            );
        }

        if (requestParameters['id'] == null) {
            throw new runtime.RequiredError(
                'id',
                'Required parameter "id" was null or undefined when calling fatturaElettronicaXmlGet().'
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
            headerParameters["Authorization"] = await this.configuration.accessToken("oauth2ClientCredentials", []);
        }

        if (this.configuration && this.configuration.accessToken) {
            // oauth required
            headerParameters["Authorization"] = await this.configuration.accessToken("oauth2", []);
        }

        const response = await this.request({
            path: `/api/v3/{companyId}/FatturaElettronicaXml/{id}`.replace(`{${"companyId"}}`, encodeURIComponent(String(requestParameters['companyId']))).replace(`{${"id"}}`, encodeURIComponent(String(requestParameters['id']))),
            method: 'GET',
            headers: headerParameters,
            query: queryParameters,
        }, initOverrides);

        return new runtime.JSONApiResponse(response, (jsonValue) => FatturaElettronicaXmlFromJSON(jsonValue));
    }

    /**
     * Restituisce un elemento.
     */
    async fatturaElettronicaXmlGet(requestParameters: FatturaElettronicaXmlGetRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<FatturaElettronicaXml> {
        const response = await this.fatturaElettronicaXmlGetRaw(requestParameters, initOverrides);
        return await response.value();
    }

    /**
     * Scarica tutte le fatture XML come archivio ZIP.
     */
    async fatturaElettronicaXmlGetAllAsArchiveRaw(requestParameters: FatturaElettronicaXmlGetAllAsArchiveRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<void>> {
        if (requestParameters['companyId'] == null) {
            throw new runtime.RequiredError(
                'companyId',
                'Required parameter "companyId" was null or undefined when calling fatturaElettronicaXmlGetAllAsArchive().'
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
            headerParameters["Authorization"] = await this.configuration.accessToken("oauth2ClientCredentials", []);
        }

        if (this.configuration && this.configuration.accessToken) {
            // oauth required
            headerParameters["Authorization"] = await this.configuration.accessToken("oauth2", []);
        }

        const response = await this.request({
            path: `/api/v3/{companyId}/FatturaElettronicaXml/bulk`.replace(`{${"companyId"}}`, encodeURIComponent(String(requestParameters['companyId']))),
            method: 'GET',
            headers: headerParameters,
            query: queryParameters,
        }, initOverrides);

        return new runtime.VoidApiResponse(response);
    }

    /**
     * Scarica tutte le fatture XML come archivio ZIP.
     */
    async fatturaElettronicaXmlGetAllAsArchive(requestParameters: FatturaElettronicaXmlGetAllAsArchiveRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<void> {
        await this.fatturaElettronicaXmlGetAllAsArchiveRaw(requestParameters, initOverrides);
    }

    /**
     * Recupera una fattura XML per nome file.
     */
    async fatturaElettronicaXmlGetAsXmlRaw(requestParameters: FatturaElettronicaXmlGetAsXmlRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<void>> {
        if (requestParameters['companyId'] == null) {
            throw new runtime.RequiredError(
                'companyId',
                'Required parameter "companyId" was null or undefined when calling fatturaElettronicaXmlGetAsXml().'
            );
        }

        if (requestParameters['fileName'] == null) {
            throw new runtime.RequiredError(
                'fileName',
                'Required parameter "fileName" was null or undefined when calling fatturaElettronicaXmlGetAsXml().'
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
            headerParameters["Authorization"] = await this.configuration.accessToken("oauth2ClientCredentials", []);
        }

        if (this.configuration && this.configuration.accessToken) {
            // oauth required
            headerParameters["Authorization"] = await this.configuration.accessToken("oauth2", []);
        }

        const response = await this.request({
            path: `/api/v3/{companyId}/FatturaElettronicaXml/{fileName}`.replace(`{${"companyId"}}`, encodeURIComponent(String(requestParameters['companyId']))).replace(`{${"fileName"}}`, encodeURIComponent(String(requestParameters['fileName']))),
            method: 'GET',
            headers: headerParameters,
            query: queryParameters,
        }, initOverrides);

        return new runtime.VoidApiResponse(response);
    }

    /**
     * Recupera una fattura XML per nome file.
     */
    async fatturaElettronicaXmlGetAsXml(requestParameters: FatturaElettronicaXmlGetAsXmlRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<void> {
        await this.fatturaElettronicaXmlGetAsXmlRaw(requestParameters, initOverrides);
    }

    /**
     * Scarica i file allegati di una fattura XML.
     */
    async fatturaElettronicaXmlGetAttachmentsRaw(requestParameters: FatturaElettronicaXmlGetAttachmentsRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<Array<AllegatoDocumento>>> {
        if (requestParameters['companyId'] == null) {
            throw new runtime.RequiredError(
                'companyId',
                'Required parameter "companyId" was null or undefined when calling fatturaElettronicaXmlGetAttachments().'
            );
        }

        if (requestParameters['fileName'] == null) {
            throw new runtime.RequiredError(
                'fileName',
                'Required parameter "fileName" was null or undefined when calling fatturaElettronicaXmlGetAttachments().'
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
            headerParameters["Authorization"] = await this.configuration.accessToken("oauth2ClientCredentials", []);
        }

        if (this.configuration && this.configuration.accessToken) {
            // oauth required
            headerParameters["Authorization"] = await this.configuration.accessToken("oauth2", []);
        }

        const response = await this.request({
            path: `/api/v3/{companyId}/FatturaElettronicaXml/{fileName}/attachments`.replace(`{${"companyId"}}`, encodeURIComponent(String(requestParameters['companyId']))).replace(`{${"fileName"}}`, encodeURIComponent(String(requestParameters['fileName']))),
            method: 'GET',
            headers: headerParameters,
            query: queryParameters,
        }, initOverrides);

        return new runtime.JSONApiResponse(response, (jsonValue) => jsonValue.map(AllegatoDocumentoFromJSON));
    }

    /**
     * Scarica i file allegati di una fattura XML.
     */
    async fatturaElettronicaXmlGetAttachments(requestParameters: FatturaElettronicaXmlGetAttachmentsRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<Array<AllegatoDocumento>> {
        const response = await this.fatturaElettronicaXmlGetAttachmentsRaw(requestParameters, initOverrides);
        return await response.value();
    }

    /**
     * Viene creato un nuovo <a href=\"#tag/Documento\">Documento</a> corrispondente al contenuto XML.
     * Importa una fattura XML.
     */
    async fatturaElettronicaXmlImportRaw(requestParameters: FatturaElettronicaXmlImportRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<Array<FatturaElettronicaImportResult>>> {
        if (requestParameters['companyId'] == null) {
            throw new runtime.RequiredError(
                'companyId',
                'Required parameter "companyId" was null or undefined when calling fatturaElettronicaXmlImport().'
            );
        }

        const queryParameters: any = {};

        const headerParameters: runtime.HTTPHeaders = {};

        if (requestParameters['idempotencyKey'] != null) {
            headerParameters['Idempotency-Key'] = String(requestParameters['idempotencyKey']);
        }

        if (this.configuration && this.configuration.accessToken) {
            const token = this.configuration.accessToken;
            const tokenString = await token("bearer", []);

            if (tokenString) {
                headerParameters["Authorization"] = `Bearer ${tokenString}`;
            }
        }
        if (this.configuration && this.configuration.accessToken) {
            // oauth required
            headerParameters["Authorization"] = await this.configuration.accessToken("oauth2ClientCredentials", []);
        }

        if (this.configuration && this.configuration.accessToken) {
            // oauth required
            headerParameters["Authorization"] = await this.configuration.accessToken("oauth2", []);
        }

        const consumes: runtime.Consume[] = [
            { contentType: 'multipart/form-data' },
        ];
        // @ts-ignore: canConsumeForm may be unused
        const canConsumeForm = runtime.canConsumeForm(consumes);

        let formParams: { append(param: string, value: any): any };
        let useForm = false;
        // use FormData to transmit files using content-type "multipart/form-data"
        useForm = canConsumeForm;
        if (useForm) {
            formParams = new FormData();
        } else {
            formParams = new URLSearchParams();
        }

        if (requestParameters['dataConsegnaSdi'] != null) {
            formParams.append('DataConsegnaSdi', (requestParameters['dataConsegnaSdi'] as any).toISOString());
        }

        if (requestParameters['identificativoSdi'] != null) {
            formParams.append('IdentificativoSdi', requestParameters['identificativoSdi'] as any);
        }

        if (requestParameters['file'] != null) {
            formParams.append('file', requestParameters['file'] as any);
        }

        const response = await this.request({
            path: `/api/v3/{companyId}/FatturaElettronicaXml/import`.replace(`{${"companyId"}}`, encodeURIComponent(String(requestParameters['companyId']))),
            method: 'POST',
            headers: headerParameters,
            query: queryParameters,
            body: formParams,
        }, initOverrides);

        return new runtime.JSONApiResponse(response, (jsonValue) => jsonValue.map(FatturaElettronicaImportResultFromJSON));
    }

    /**
     * Viene creato un nuovo <a href=\"#tag/Documento\">Documento</a> corrispondente al contenuto XML.
     * Importa una fattura XML.
     */
    async fatturaElettronicaXmlImport(requestParameters: FatturaElettronicaXmlImportRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<Array<FatturaElettronicaImportResult>> {
        const response = await this.fatturaElettronicaXmlImportRaw(requestParameters, initOverrides);
        return await response.value();
    }

    /**
     *  La risposta include due header con informazioni sui risultati.  `X-Read-TotalCount` indica il numero di elementi che soddisfano il filtro impostato nella query;  `X-Read-Count` indica il numero di elementi effettivamente contenuti nella risposta.  I due header possono riportare valori diversi quando i parametri `Take` e `Skip` sono stati usati nelle opzioni di query.
     * Restituisce una lista di elementi.
     */
    async fatturaElettronicaXmlListRaw(requestParameters: FatturaElettronicaXmlListRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<Array<FatturaElettronicaXml>>> {
        if (requestParameters['companyId'] == null) {
            throw new runtime.RequiredError(
                'companyId',
                'Required parameter "companyId" was null or undefined when calling fatturaElettronicaXmlList().'
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
            headerParameters["Authorization"] = await this.configuration.accessToken("oauth2ClientCredentials", []);
        }

        if (this.configuration && this.configuration.accessToken) {
            // oauth required
            headerParameters["Authorization"] = await this.configuration.accessToken("oauth2", []);
        }

        const response = await this.request({
            path: `/api/v3/{companyId}/FatturaElettronicaXml`.replace(`{${"companyId"}}`, encodeURIComponent(String(requestParameters['companyId']))),
            method: 'GET',
            headers: headerParameters,
            query: queryParameters,
        }, initOverrides);

        return new runtime.JSONApiResponse(response, (jsonValue) => jsonValue.map(FatturaElettronicaXmlFromJSON));
    }

    /**
     *  La risposta include due header con informazioni sui risultati.  `X-Read-TotalCount` indica il numero di elementi che soddisfano il filtro impostato nella query;  `X-Read-Count` indica il numero di elementi effettivamente contenuti nella risposta.  I due header possono riportare valori diversi quando i parametri `Take` e `Skip` sono stati usati nelle opzioni di query.
     * Restituisce una lista di elementi.
     */
    async fatturaElettronicaXmlList(requestParameters: FatturaElettronicaXmlListRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<Array<FatturaElettronicaXml>> {
        const response = await this.fatturaElettronicaXmlListRaw(requestParameters, initOverrides);
        return await response.value();
    }

    /**
     * Restituisce una nuova istanza di un oggetto. Dove necessario, i valori delle proprietà saranno coerenti con lo stato e la logica dell\'applicazione (ad es., una nuova istanza di `Documento` avrà il `Numero` appropriato, basato sui documenti preesistenti di tipo compatibile).
     */
    async fatturaElettronicaXmlNewInstanceRaw(requestParameters: FatturaElettronicaXmlNewInstanceRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<FatturaElettronicaXml>> {
        if (requestParameters['companyId'] == null) {
            throw new runtime.RequiredError(
                'companyId',
                'Required parameter "companyId" was null or undefined when calling fatturaElettronicaXmlNewInstance().'
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
            headerParameters["Authorization"] = await this.configuration.accessToken("oauth2ClientCredentials", []);
        }

        if (this.configuration && this.configuration.accessToken) {
            // oauth required
            headerParameters["Authorization"] = await this.configuration.accessToken("oauth2", []);
        }

        const response = await this.request({
            path: `/api/v3/{companyId}/FatturaElettronicaXml/new`.replace(`{${"companyId"}}`, encodeURIComponent(String(requestParameters['companyId']))),
            method: 'GET',
            headers: headerParameters,
            query: queryParameters,
        }, initOverrides);

        return new runtime.JSONApiResponse(response, (jsonValue) => FatturaElettronicaXmlFromJSON(jsonValue));
    }

    /**
     * Restituisce una nuova istanza di un oggetto. Dove necessario, i valori delle proprietà saranno coerenti con lo stato e la logica dell\'applicazione (ad es., una nuova istanza di `Documento` avrà il `Numero` appropriato, basato sui documenti preesistenti di tipo compatibile).
     */
    async fatturaElettronicaXmlNewInstance(requestParameters: FatturaElettronicaXmlNewInstanceRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<FatturaElettronicaXml> {
        const response = await this.fatturaElettronicaXmlNewInstanceRaw(requestParameters, initOverrides);
        return await response.value();
    }

    /**
     * Associa una fattura XML a un documento esistente.
     */
    async fatturaElettronicaXmlPairRaw(requestParameters: FatturaElettronicaXmlPairRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<void>> {
        if (requestParameters['companyId'] == null) {
            throw new runtime.RequiredError(
                'companyId',
                'Required parameter "companyId" was null or undefined when calling fatturaElettronicaXmlPair().'
            );
        }

        const queryParameters: any = {};

        const headerParameters: runtime.HTTPHeaders = {};

        if (requestParameters['idempotencyKey'] != null) {
            headerParameters['Idempotency-Key'] = String(requestParameters['idempotencyKey']);
        }

        if (this.configuration && this.configuration.accessToken) {
            const token = this.configuration.accessToken;
            const tokenString = await token("bearer", []);

            if (tokenString) {
                headerParameters["Authorization"] = `Bearer ${tokenString}`;
            }
        }
        if (this.configuration && this.configuration.accessToken) {
            // oauth required
            headerParameters["Authorization"] = await this.configuration.accessToken("oauth2ClientCredentials", []);
        }

        if (this.configuration && this.configuration.accessToken) {
            // oauth required
            headerParameters["Authorization"] = await this.configuration.accessToken("oauth2", []);
        }

        const consumes: runtime.Consume[] = [
            { contentType: 'multipart/form-data' },
        ];
        // @ts-ignore: canConsumeForm may be unused
        const canConsumeForm = runtime.canConsumeForm(consumes);

        let formParams: { append(param: string, value: any): any };
        let useForm = false;
        // use FormData to transmit files using content-type "multipart/form-data"
        useForm = canConsumeForm;
        if (useForm) {
            formParams = new FormData();
        } else {
            formParams = new URLSearchParams();
        }

        if (requestParameters['fileName'] != null) {
            formParams.append('FileName', requestParameters['fileName'] as any);
        }

        if (requestParameters['progressivo'] != null) {
            formParams.append('Progressivo', requestParameters['progressivo'] as any);
        }

        if (requestParameters['documentoId'] != null) {
            formParams.append('DocumentoId', requestParameters['documentoId'] as any);
        }

        if (requestParameters['file'] != null) {
            formParams.append('file', requestParameters['file'] as any);
        }

        const response = await this.request({
            path: `/api/v3/{companyId}/FatturaElettronicaXml/pair`.replace(`{${"companyId"}}`, encodeURIComponent(String(requestParameters['companyId']))),
            method: 'POST',
            headers: headerParameters,
            query: queryParameters,
            body: formParams,
        }, initOverrides);

        return new runtime.VoidApiResponse(response);
    }

    /**
     * Associa una fattura XML a un documento esistente.
     */
    async fatturaElettronicaXmlPair(requestParameters: FatturaElettronicaXmlPairRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<void> {
        await this.fatturaElettronicaXmlPairRaw(requestParameters, initOverrides);
    }

    /**
     * Salva un nuovo elemento.
     */
    async fatturaElettronicaXmlPostRaw(requestParameters: FatturaElettronicaXmlPostRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<FatturaElettronicaXml>> {
        if (requestParameters['companyId'] == null) {
            throw new runtime.RequiredError(
                'companyId',
                'Required parameter "companyId" was null or undefined when calling fatturaElettronicaXmlPost().'
            );
        }

        const queryParameters: any = {};

        if (requestParameters['validationOverride'] != null) {
            queryParameters['validationOverride'] = requestParameters['validationOverride'];
        }

        const headerParameters: runtime.HTTPHeaders = {};

        headerParameters['Content-Type'] = 'application/json';

        if (requestParameters['idempotencyKey'] != null) {
            headerParameters['Idempotency-Key'] = String(requestParameters['idempotencyKey']);
        }

        if (this.configuration && this.configuration.accessToken) {
            const token = this.configuration.accessToken;
            const tokenString = await token("bearer", []);

            if (tokenString) {
                headerParameters["Authorization"] = `Bearer ${tokenString}`;
            }
        }
        if (this.configuration && this.configuration.accessToken) {
            // oauth required
            headerParameters["Authorization"] = await this.configuration.accessToken("oauth2ClientCredentials", []);
        }

        if (this.configuration && this.configuration.accessToken) {
            // oauth required
            headerParameters["Authorization"] = await this.configuration.accessToken("oauth2", []);
        }

        const response = await this.request({
            path: `/api/v3/{companyId}/FatturaElettronicaXml`.replace(`{${"companyId"}}`, encodeURIComponent(String(requestParameters['companyId']))),
            method: 'POST',
            headers: headerParameters,
            query: queryParameters,
            body: FatturaElettronicaXmlToJSON(requestParameters['fatturaElettronicaXml']),
        }, initOverrides);

        return new runtime.JSONApiResponse(response, (jsonValue) => FatturaElettronicaXmlFromJSON(jsonValue));
    }

    /**
     * Salva un nuovo elemento.
     */
    async fatturaElettronicaXmlPost(requestParameters: FatturaElettronicaXmlPostRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<FatturaElettronicaXml> {
        const response = await this.fatturaElettronicaXmlPostRaw(requestParameters, initOverrides);
        return await response.value();
    }

    /**
     * Aggiorna un elemento esistente.
     */
    async fatturaElettronicaXmlPutRaw(requestParameters: FatturaElettronicaXmlPutRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<FatturaElettronicaXml>> {
        if (requestParameters['companyId'] == null) {
            throw new runtime.RequiredError(
                'companyId',
                'Required parameter "companyId" was null or undefined when calling fatturaElettronicaXmlPut().'
            );
        }

        if (requestParameters['id'] == null) {
            throw new runtime.RequiredError(
                'id',
                'Required parameter "id" was null or undefined when calling fatturaElettronicaXmlPut().'
            );
        }

        const queryParameters: any = {};

        if (requestParameters['validationOverride'] != null) {
            queryParameters['validationOverride'] = requestParameters['validationOverride'];
        }

        const headerParameters: runtime.HTTPHeaders = {};

        headerParameters['Content-Type'] = 'application/json';

        if (requestParameters['idempotencyKey'] != null) {
            headerParameters['Idempotency-Key'] = String(requestParameters['idempotencyKey']);
        }

        if (this.configuration && this.configuration.accessToken) {
            const token = this.configuration.accessToken;
            const tokenString = await token("bearer", []);

            if (tokenString) {
                headerParameters["Authorization"] = `Bearer ${tokenString}`;
            }
        }
        if (this.configuration && this.configuration.accessToken) {
            // oauth required
            headerParameters["Authorization"] = await this.configuration.accessToken("oauth2ClientCredentials", []);
        }

        if (this.configuration && this.configuration.accessToken) {
            // oauth required
            headerParameters["Authorization"] = await this.configuration.accessToken("oauth2", []);
        }

        const response = await this.request({
            path: `/api/v3/{companyId}/FatturaElettronicaXml/{id}`.replace(`{${"companyId"}}`, encodeURIComponent(String(requestParameters['companyId']))).replace(`{${"id"}}`, encodeURIComponent(String(requestParameters['id']))),
            method: 'PUT',
            headers: headerParameters,
            query: queryParameters,
            body: FatturaElettronicaXmlToJSON(requestParameters['fatturaElettronicaXml']),
        }, initOverrides);

        return new runtime.JSONApiResponse(response, (jsonValue) => FatturaElettronicaXmlFromJSON(jsonValue));
    }

    /**
     * Aggiorna un elemento esistente.
     */
    async fatturaElettronicaXmlPut(requestParameters: FatturaElettronicaXmlPutRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<FatturaElettronicaXml> {
        const response = await this.fatturaElettronicaXmlPutRaw(requestParameters, initOverrides);
        return await response.value();
    }

    /**
     * Il <a href=\"https://gestionaleamica.com/Software/ServizioInterscambioFatture\">Servizio di Interscambio Documenti</a> deve essere attivo per l\'azienda e la relativa chiave di attivazione deve essere presente in `SdiApiKey`.
     * Invia una o più fatture al Sistema di Interscambio (SDI).
     */
    async fatturaElettronicaXmlUploadRaw(requestParameters: FatturaElettronicaXmlUploadRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<FatturaElettronicaUploadResult>> {
        if (requestParameters['companyId'] == null) {
            throw new runtime.RequiredError(
                'companyId',
                'Required parameter "companyId" was null or undefined when calling fatturaElettronicaXmlUpload().'
            );
        }

        const queryParameters: any = {};

        const headerParameters: runtime.HTTPHeaders = {};

        headerParameters['Content-Type'] = 'application/json';

        if (requestParameters['idempotencyKey'] != null) {
            headerParameters['Idempotency-Key'] = String(requestParameters['idempotencyKey']);
        }

        if (this.configuration && this.configuration.accessToken) {
            const token = this.configuration.accessToken;
            const tokenString = await token("bearer", []);

            if (tokenString) {
                headerParameters["Authorization"] = `Bearer ${tokenString}`;
            }
        }
        if (this.configuration && this.configuration.accessToken) {
            // oauth required
            headerParameters["Authorization"] = await this.configuration.accessToken("oauth2ClientCredentials", []);
        }

        if (this.configuration && this.configuration.accessToken) {
            // oauth required
            headerParameters["Authorization"] = await this.configuration.accessToken("oauth2", []);
        }

        const response = await this.request({
            path: `/api/v3/{companyId}/FatturaElettronicaXml/sdi/upload`.replace(`{${"companyId"}}`, encodeURIComponent(String(requestParameters['companyId']))),
            method: 'POST',
            headers: headerParameters,
            query: queryParameters,
            body: FatturaElettronicaUploadOptionsToJSON(requestParameters['fatturaElettronicaUploadOptions']),
        }, initOverrides);

        return new runtime.JSONApiResponse(response, (jsonValue) => FatturaElettronicaUploadResultFromJSON(jsonValue));
    }

    /**
     * Il <a href=\"https://gestionaleamica.com/Software/ServizioInterscambioFatture\">Servizio di Interscambio Documenti</a> deve essere attivo per l\'azienda e la relativa chiave di attivazione deve essere presente in `SdiApiKey`.
     * Invia una o più fatture al Sistema di Interscambio (SDI).
     */
    async fatturaElettronicaXmlUpload(requestParameters: FatturaElettronicaXmlUploadRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<FatturaElettronicaUploadResult> {
        const response = await this.fatturaElettronicaXmlUploadRaw(requestParameters, initOverrides);
        return await response.value();
    }

}
