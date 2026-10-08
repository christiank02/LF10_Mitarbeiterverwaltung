# Mitarbeiterverwaltung – LF10

Angular-Lernprojekt zur Verwaltung von Mitarbeitern und Qualifikationen, mit
Detailansichten, OIDC-Anmeldung und einer Oberfläche zum Anlegen von Testdaten.

Das Repository enthält das Angular-Frontend und die lokale Infrastruktur.
Das Backend wird als externes Docker-Image eingebunden und ist keine eigene
Implementierung dieses Repositories.

## Voraussetzungen

- Node.js 20.11.1+ aus der 20er-Reihe und npm (passend zu Angular 18).
- Docker mit Docker Compose.
- Freie Ports 4200, 5432, 8089, 9001 und 9443.

## Lokal starten

```bash
npm ci
docker compose up -d
npm start
```

| Dienst | Adresse |
| --- | --- |
| Angular-App | <http://localhost:4200> |
| Backend / Swagger | <http://localhost:8089/swagger> |
| Authentik | <http://localhost:9001> |

Authentik wird am Host auf **9001** veröffentlicht; 9000 ist sein Container-Port.
Die [Auth-Konfiguration](src/app/services/auth/auth.service.ts) verwendet deshalb
`http://localhost:9001/application/o/employee_api/`.

Beim ersten Start richtet der Authentik-Worker den Provider über das
[Blueprint](authentik_blueprints/zzz_employee_setup.yaml) ein. Falls die Anmeldung
noch nicht funktioniert, zuerst `docker compose logs authentik-worker` prüfen
und den Abschluss des Starts abwarten.

Für die lokale Demo ist das Authentik-Administratorkonto `akadmin` mit der
Bootstrap-E-Mail `a@b.com` und dem Passwort `secret` konfiguriert.
Unter **Directory → Users** dem Demo-Benutzer `john` ein eigenes Testpasswort
geben. Anschließend die Angular-App öffnen und die OIDC-Anmeldung durchführen.
Die Zugangsdaten und Schlüssel in `compose.yml` sind ausschließlich Demo-Werte.

Für manuelle API-Anfragen enthält [getBearerToken.http](getBearerToken.http)
eine Vorlage für die VS-Code-Erweiterung REST Client. Ein eigenes, befristetes
App-Passwort für `john` wird über `EMPLOYEE_APP_PASSWORD` übergeben; der
Bearer-Token wird direkt aus der vorherigen Antwort gelesen. Passwörter und
Tokens nicht in die Vorlage eintragen. Lokale `.env`-Dateien und private
HTTP-Client-Konfigurationen sind von Git ausgeschlossen.

## Projektaufbau

- [src/app](src/app): Routen, Mitarbeiter- und Qualifikationsansichten, Dienste.
- [app.routes.ts](src/app/app.routes.ts): geschützte Ansichten und Login-Callback.
- [compose.yml](compose.yml): Backend, Datenbanken, Redis und Authentik.
- [authentik_blueprints](authentik_blueprints): Provider- und Benutzerkonfiguration.

## Prüfen und stoppen

```bash
npm run build
npm test
docker compose down
```

Die Tests verwenden Karma und benötigen einen Browser. `docker compose down`
behält Datenbank-Volumes. Ein kompletter lokaler Reset ist mit
`docker compose down --volumes` möglich, löscht aber **alle Daten dieser
Compose-Umgebung**, einschließlich der Authentik-Einrichtung.

Das Projekt ist für Lernen und lokale Demonstrationen gedacht. Das ältere
Framework, die externen Container und die Auth-Konfiguration benötigen vor
einem öffentlichen Betrieb eine gesonderte Aktualisierung und Prüfung.
