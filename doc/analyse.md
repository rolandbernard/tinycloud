Analyse
=======

## 1. General Information
Wir haben kein eigenes Unternehmen, wir sind nur Teil einer Schulklasse, der
aufgetragen wurde Teams zu bilden. <br>
Unser Team besteht aus:
- Roland Bernard
- Benjamin Herbst

Wir haben keine direkte Konkurenz, nur die anderen Teams unserer Klasse,
falls man diese als Konkurenz bezeichen kann. Wir wissen nähmlich nicht genau
in welcher Form sie diese Aufgabe vor haben umzusetzten.

## 2. New Project / Redesign
Dies ist ein komplett neues Projekt und wir haben zur Zeit keine bestehende 
derartige Webanwendung. Wir haben zwar einige private Websiten, aber keine 
welche eine solche aufgabe hat.

## 3. Expectations
- Es wird erwarted, dass die Kunden die Webanwendung als, ein Tool nutzen, um 
ihre Dateien sicher und zuverlässig abspeichern und überall abrufen zu können.
- Dies könnte von Kunden die sowohl im Büro als auch von Zuhause aus arbeiten
interessant sein, da jene Kunden öfters Dateien in mehreren orten zugänglich
haben wollten.

## 4. Type of Website
Bei der Website handelt es sich um eine Webanwendung zur Abspeicherung von
Dateien die der Nutzter selbst hochladen kann. Wobei die Dateien eines Nutzters
durch einen Benutzternamen und ein Passwort geschützt werden. Es handelt sich um
eine Single Page Application.

## 5. Structure
Es wird nur zwei Haubtseite, neben der Seite welche bei einem Fehler, zum
Beispiel `File not found`, geliefert wird, geben. Eine Seite dient zur
Interaktion mit den eigenen Daten. Hierfür muss der Benutzer zwingent angemeldet
sein, um seine Ordnerstrucktur darstellen zu können. Ist der Benutzer beim
öffnen der Seite noch nicht angemeldet wird ein Login-Fensert angezeigt und der
Benutzer kann sich anmelden.
Die zweite Seite dient zum Anzeigen von Daten eines anderen Benutzers welche
nicht umbedingt in der eigenen Ordnerstrucktur vorhanden sind, abere auf welche
man zugreifen kann, weil sie geteilt wurden. Falls zum Abruf der Daten keine
Anmeldung notwendieg ist, da die Daten mit jedem geteilt wurden, wird der Nutzer
nicht aufgefordert sich anzumelden.
Verschiedene Informationen werden in diesen beiden Seiten mithilfe von
AJAX-Abfragen angefragen und ein bzw. mithilfe von Javascript ausgeblendet
werden.
Die wich die Darstellung der Ordnerstrucktur, 
welche die zentrale Ansicht beider Seiten ist. Hier werden die Ordner und
Dateien angezeigt. Für jeden Ordenr und für jede Datei wird angezeigt wem der
Ordner, bzw. die Datei, gehört und wann und von wem diese zu letzt geändert
wurde. Für Dateien wird zudem noch die Dateigröße angezeigt.

## 6. Static or Dynamic
Unsere Webanwendung ist dynamisch, da es sich um eine Sigle Page Application
handelt. Alle Änderungen des angezeigten Inhaltes werden dynamisch im
Hintergrund mithilfe von Javascript durchgeführt. Die Anmeldung, die
Benutzerdaten, die Ordenerstrucktur, Daten und Methainformationen werden alle
mit einer REST-API zur Verfügung gestellt, auf welche das Client-Seitige
Javascript zugreift.

## 7. Functionalities
Die Webanwendung soll die Möglichkeit bieten Dateien hochzuladen und in Ordnern
zu organisieren, um sie an einem späteren Moment wieder Herunterlagen zu können.
Die Funktionalität ist also mit einer Webanwendung wie Google Drive oder MEGA
vergleichbar. Allerdings wird die Webseite einfacher gehalten sein und keine
zusätzlichen Funktionalitäten neben dem Abspeichern von Dateien und Ordnern zur
verfügung stellen. Zudem werden die Daten auf einem eigenen Server gelagert und
nicht an Drittunternehmen weitergeleitet.

## 8. Budget
0€ + Arbeit

Die Webanwendung muss ohne jeglichem Aufwand von finanziellen Mitteln realisiert
werden, da wir nicht vor haben diese anzuwenden.

## 9. Deadlines
- Diese 10-Punkte zur Definition der Webanwendung und deren Funktionalitäten
sind bis zum 20. November auf der Lernplatform "Moodle" abzugeben.
- Der Abgabetermin der Website an sich und auch das Datum der Präsentation ist
zum jetztigen Zeitpunkt noch nicht festelegt worden. Die Webseite muss im
Git-Repository, welches von Github Classroom restellt wurde abgelegt werde.

## 10. Additional Infos
Nähere Informationen können auf unserem Git-Repository gefunden werden. Dort
befindet sich stetig die aktuellste Version unserer Webanwendung.
