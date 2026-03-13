INSERT INTO quiz_questions (question, options, correct_option, category) VALUES
-- Q1 geography easy
(
  '{"es":"¿Cuál es el río más largo del mundo?","en":"What is the longest river in the world?","eu":"Zein da munduko ibairik luzeena?","ca":"Quin es el riu mes llarg del mon?","fr":"Quel est le plus long fleuve du monde?","gl":"Cal e o rio mais longo do mundo?","it":"Qual e il fiume piu lungo del mondo?","de":"Welcher ist der laengste Fluss der Welt?","pt":"Qual e o rio mais longo do mundo?"}'::jsonb,
  '[{"es":"Amazonas","en":"Amazon","eu":"Amazonas","ca":"Amazones","fr":"Amazone","gl":"Amazonas","it":"Rio delle Amazzoni","de":"Amazonas","pt":"Amazonas"},{"es":"Nilo","en":"Nile","eu":"Nilo","ca":"Nil","fr":"Nil","gl":"Nilo","it":"Nilo","de":"Nil","pt":"Nilo"},{"es":"Misisipi","en":"Mississippi","eu":"Misisipi","ca":"Mississipí","fr":"Mississippi","gl":"Misisipi","it":"Mississippi","de":"Mississippi","pt":"Mississippi"},{"es":"Yangtsé","en":"Yangtze","eu":"Yangtze","ca":"Iangtse","fr":"Yangtsé","gl":"Yangtsé","it":"Yangzi Jiang","de":"Jangtsekiang","pt":"Yangtzé"}]'::jsonb,
  1, 'geography'
),
-- Q2 science easy
(
  '{"es":"¿Cuál es el símbolo químico del agua?","en":"What is the chemical symbol for water?","eu":"Zein da uraren ikur kimikoa?","ca":"Quin es el simbol quimic de l aigua?","fr":"Quel est le symbole chimique de l eau?","gl":"Cal e o símbolo químico da auga?","it":"Qual e il símbolo chimico dell acqua?","de":"Was ist das chemische Symbol fuer Wasser?","pt":"Qual e o símbolo químico da agua?"}'::jsonb,
  '[{"es":"HO","en":"HO","eu":"HO","ca":"HO","fr":"HO","gl":"HO","it":"HO","de":"HO","pt":"HO"},{"es":"H2O","en":"H2O","eu":"H2O","ca":"H2O","fr":"H2O","gl":"H2O","it":"H2O","de":"H2O","pt":"H2O"},{"es":"CO2","en":"CO2","eu":"CO2","ca":"CO2","fr":"CO2","gl":"CO2","it":"CO2","de":"CO2","pt":"CO2"},{"es":"O2","en":"O2","eu":"O2","ca":"O2","fr":"O2","gl":"O2","it":"O2","de":"O2","pt":"O2"}]'::jsonb,
  1, 'science'
),
-- Q3 space easy
(
  '{"es":"¿Cuál es el planeta más grande del sistema solar?","en":"What is the largest planet in the solar system?","eu":"Zein da eguzki-sistemako planetarik handiena?","ca":"Quin es el planeta mes gran del sistema solar?","fr":"Quelle est la plus grande planete du systeme solaire?","gl":"Cal e o planeta mais grande do sistema solar?","it":"Qual e il pianeta piu grande del sistema solare?","de":"Welcher ist der groesste Planet im Sonnensystem?","pt":"Qual e o maior planeta do sistema solar?"}'::jsonb,
  '[{"es":"Saturno","en":"Saturn","eu":"Saturno","ca":"Saturn","fr":"Saturne","gl":"Saturno","it":"Saturno","de":"Saturn","pt":"Saturno"},{"es":"Neptuno","en":"Neptune","eu":"Neptuno","ca":"Neptu","fr":"Neptune","gl":"Neptuno","it":"Nettuno","de":"Neptun","pt":"Neptuno"},{"es":"Júpiter","en":"Jupiter","eu":"Jupiter","ca":"Jupiter","fr":"Jupiter","gl":"Xupiter","it":"Giove","de":"Jupiter","pt":"Jupiter"},{"es":"Urano","en":"Uranus","eu":"Urano","ca":"Ura","fr":"Uranus","gl":"Urano","it":"Urano","de":"Uranus","pt":"Urano"}]'::jsonb,
  2, 'space'
),
-- Q4 animals easy
(
  '{"es":"¿Cuál es el animal terrestre más rápido?","en":"What is the fastest land animal?","eu":"Zein da lurreko animaliarik azkarrena?","ca":"Quin es l animal terrestre mes rapid?","fr":"Quel est l animal terrestre le plus rapide?","gl":"Cal e o animal terrestre mais rápido?","it":"Qual e l animale terrestre piu veloce?","de":"Welches ist das schnellste Landtier?","pt":"Qual e o animal terrestre mais rápido?"}'::jsonb,
  '[{"es":"León","en":"Lion","eu":"Lehoia","ca":"Lleo","fr":"Lion","gl":"Leon","it":"Leone","de":"Loewe","pt":"Leao"},{"es":"Guepardo","en":"Cheetah","eu":"Gepardoa","ca":"Guepard","fr":"Guepard","gl":"Guepardo","it":"Ghepardo","de":"Gepard","pt":"Guepardo"},{"es":"Caballo","en":"Horse","eu":"Zaldia","ca":"Cavall","fr":"Cheval","gl":"Cabalo","it":"Cavallo","de":"Pferd","pt":"Cavalo"},{"es":"Gacela","en":"Gazelle","eu":"Gazela","ca":"Gasela","fr":"Gazelle","gl":"Gacela","it":"Gazzella","de":"Gazelle","pt":"Gazela"}]'::jsonb,
  1, 'animals'
),
-- Q5 history easy
(
  '{"es":"¿En qué año llegó el hombre a la Luna?","en":"In what year did man land on the Moon?","eu":"Zein urtetan iritsi zen gizakia Ilargira?","ca":"En quin any va arribar l home a la Lluna?","fr":"En quelle annee l homme a-t-il marche sur la Lune?","gl":"En que ano chegou o home a Lua?","it":"In che anno l uomo e arrivato sulla Luna?","de":"In welchem Jahr landete der Mensch auf dem Mond?","pt":"Em que ano ohomem chegou a Lua?"}'::jsonb,
  '[{"es":"1965","en":"1965","eu":"1965","ca":"1965","fr":"1965","gl":"1965","it":"1965","de":"1965","pt":"1965"},{"es":"1969","en":"1969","eu":"1969","ca":"1969","fr":"1969","gl":"1969","it":"1969","de":"1969","pt":"1969"},{"es":"1972","en":"1972","eu":"1972","ca":"1972","fr":"1972","gl":"1972","it":"1972","de":"1972","pt":"1972"},{"es":"1959","en":"1959","eu":"1959","ca":"1959","fr":"1959","gl":"1959","it":"1959","de":"1959","pt":"1959"}]'::jsonb,
  1, 'history'
),
-- Q6 landmarks easy
(
  '{"es":"¿En qué ciudad se encuentra la Torre Eiffel?","en":"In which city is the Eiffel Tower located?","eu":"Zein hiritan dago Eiffel Dorrea?","ca":"A quina ciutat es troba la Torre Eiffel?","fr":"Dans quelle ville se trouve la Tour Eiffel?","gl":"En que cidade esta a Torre Eiffel?","it":"In quale citta si trova la Torre Eiffel?","de":"In welcher Stadt steht der Eiffelturm?","pt":"Em que cidade se encontra a Torre Eiffel?"}'::jsonb,
  '[{"es":"Londres","en":"London","eu":"Londres","ca":"Londres","fr":"Londres","gl":"Londres","it":"Londra","de":"London","pt":"Londres"},{"es":"Roma","en":"Rome","eu":"Erroma","ca":"Roma","fr":"Rome","gl":"Roma","it":"Roma","de":"Rom","pt":"Roma"},{"es":"París","en":"Paris","eu":"Paris","ca":"Paris","fr":"Paris","gl":"Paris","it":"Parigi","de":"Paris","pt":"Paris"},{"es":"Berlín","en":"Berlin","eu":"Berlin","ca":"Berlin","fr":"Berlin","gl":"Berlin","it":"Berlino","de":"Berlin","pt":"Berlim"}]'::jsonb,
  2, 'landmarks'
),
-- Q7 body easy
(
  '{"es":"¿Cuántos huesos tiene el cuerpo humano adulto?","en":"How many bones does the adult human body have?","eu":"Zenbat hezur ditu giza gorputz helduak?","ca":"Quants ossos te el cos huma adult?","fr":"Combien d os compte le corps humain adulte?","gl":"Cantos osos ten o corpo humano adulto?","it":"Quante ossa ha il corpo umano adulto?","de":"Wie viele Knochen hat der erwachsene menschliche Koerper?","pt":"Quantos ossos tem o corpo humano adulto?"}'::jsonb,
  '[{"es":"206","en":"206","eu":"206","ca":"206","fr":"206","gl":"206","it":"206","de":"206","pt":"206"},{"es":"186","en":"186","eu":"186","ca":"186","fr":"186","gl":"186","it":"186","de":"186","pt":"186"},{"es":"256","en":"256","eu":"256","ca":"256","fr":"256","gl":"256","it":"256","de":"256","pt":"256"},{"es":"300","en":"300","eu":"300","ca":"300","fr":"300","gl":"300","it":"300","de":"300","pt":"300"}]'::jsonb,
  0, 'body'
),
-- Q8 cinema easy
(
  '{"es":"¿Quién dirigió la película Titanic?","en":"Who directed the movie Titanic?","eu":"Nork zuzendu zuen Titanic filma?","ca":"Qui va dirigir la pel·licula Titanic?","fr":"Qui a realise le film Titanic?","gl":"Quen dirixiu a película Titanic?","it":"Chi ha diretto il film Titanic?","de":"Wer hat den Film Titanic gedreht?","pt":"Quem dirigiu o filme Titanic?"}'::jsonb,
  '[{"es":"Steven Spielberg","en":"Steven Spielberg","eu":"Steven Spielberg","ca":"Steven Spielberg","fr":"Steven Spielberg","gl":"Steven Spielberg","it":"Steven Spielberg","de":"Steven Spielberg","pt":"Steven Spielberg"},{"es":"James Cameron","en":"James Cameron","eu":"James Cameron","ca":"James Cameron","fr":"James Cameron","gl":"James Cameron","it":"James Cameron","de":"James Cameron","pt":"James Cameron"},{"es":"Martin Scorsese","en":"Martin Scorsese","eu":"Martin Scorsese","ca":"Martin Scorsese","fr":"Martin Scorsese","gl":"Martin Scorsese","it":"Martin Scorsese","de":"Martin Scorsese","pt":"Martin Scorsese"},{"es":"Ridley Scott","en":"Ridley Scott","eu":"Ridley Scott","ca":"Ridley Scott","fr":"Ridley Scott","gl":"Ridley Scott","it":"Ridley Scott","de":"Ridley Scott","pt":"Ridley Scott"}]'::jsonb,
  1, 'cinema'
),
-- Q9 music easy
(
  '{"es":"¿Cuál es el instrumento musical más grande de la orquesta?","en":"What is the largest musical instrument in the orchestra?","eu":"Zein da orkestako musika-tresnararik handiena?","ca":"Quin es l instrument musical mes gran de l orquestra?","fr":"Quel est le plus grand instrument de l orchestre?","gl":"Cal e o instrumento musical mais grande da orquestra?","it":"Qual e il piu grande strumento musicale dell orchestra?","de":"Welches ist das groesste Musikinstrument im Orchester?","pt":"Qual e o maior instrumento musical da orquestra?"}'::jsonb,
  '[{"es":"Violín","en":"Violin","eu":"Biolina","ca":"Violi","fr":"Violon","gl":"Violin","it":"Violino","de":"Geige","pt":"Violino"},{"es":"Contrabajo","en":"Double bass","eu":"Kontrabaxua","ca":"Contrabaix","fr":"Contrebasse","gl":"Contrabaixo","it":"Contrabbasso","de":"Kontrabass","pt":"Contrabaixo"},{"es":"Arpa","en":"Harp","eu":"Harpa","ca":"Arpa","fr":"Harpe","gl":"Arpa","it":"Arpa","de":"Harfe","pt":"Harpa"},{"es":"Piano","en":"Piano","eu":"Pianoa","ca":"Piano","fr":"Piano","gl":"Piano","it":"Pianoforte","de":"Klavier","pt":"Piano"}]'::jsonb,
  1, 'music'
),
-- Q10 food easy
(
  '{"es":"¿De qué país es originario el sushi?","en":"Which country does sushi originate from?","eu":"Zein herrialdekoa da sushia jatorriz?","ca":"De quin pais es originari el sushi?","fr":"De quel pays le sushi est-il originaire?","gl":"De que pais eorixinario o sushi?","it":"Da quale paese ha origine il sushi?","de":"Aus welchem Land stammt Sushi?","pt":"De que pais eoriginario o sushi?"}'::jsonb,
  '[{"es":"China","en":"China","eu":"Txina","ca":"Xina","fr":"Chine","gl":"China","it":"Cina","de":"China","pt":"China"},{"es":"Corea del Sur","en":"South Korea","eu":"Hego Korea","ca":"Corea del Sud","fr":"Coree du Sud","gl":"Corea do Sur","it":"Corea del Sud","de":"Suedkorea","pt":"Coreia do Sul"},{"es":"Japón","en":"Japan","eu":"Japonia","ca":"Japo","fr":"Japon","gl":"Xapon","it":"Giappone","de":"Japan","pt":"Japao"},{"es":"Tailandia","en":"Thailand","eu":"Thailandia","ca":"Tailandia","fr":"Thailande","gl":"Tailandia","it":"Thailandia","de":"Thailand","pt":"Tailandia"}]'::jsonb,
  2, 'food'
),
-- Q11 science easy
(
  '{"es":"¿Cuál es el planeta más cercano al Sol?","en":"What is the closest planet to the Sun?","eu":"Zein da Eguzkitik hurbilen dagoen planeta?","ca":"Quin es el planeta mes proper al Sol?","fr":"Quelle est la planete la plus proche du Soleil?","gl":"Cal e o planeta mais cercano ao Sol?","it":"Qual e il pianeta piu vicino al Sole?","de":"Welcher Planet ist der Sonne am naechsten?","pt":"Qual e o planeta mais proximo do Sol?"}'::jsonb,
  '[{"es":"Venus","en":"Venus","eu":"Artizarra","ca":"Venus","fr":"Venus","gl":"Venus","it":"Venere","de":"Venus","pt":"Venus"},{"es":"Mercurio","en":"Mercury","eu":"Merkurio","ca":"Mercuri","fr":"Mercure","gl":"Mercurio","it":"Mercurio","de":"Merkur","pt":"Mercurio"},{"es":"Marte","en":"Mars","eu":"Marte","ca":"Mart","fr":"Mars","gl":"Marte","it":"Marte","de":"Mars","pt":"Marte"},{"es":"Tierra","en":"Earth","eu":"Lurra","ca":"Terra","fr":"Terre","gl":"Terra","it":"Terra","de":"Erde","pt":"Terra"}]'::jsonb,
  1, 'space'
),
-- Q12 nature easy
(
  '{"es":"¿Cuál es el océaño más grande del mundo?","en":"What is the largest ocean in the world?","eu":"Zein da munduko ozeanorik handiena?","ca":"Quin es l ocea mes gran del mon?","fr":"Quel est le plus grand ocean du monde?","gl":"Cal e o océano mais grande do mundo?","it":"Qual e l océano piu grande del mondo?","de":"Welcher ist der groesste Ozean der Welt?","pt":"Qual e o maior océano do mundo?"}'::jsonb,
  '[{"es":"Atlántico","en":"Atlantic","eu":"Atlantikoa","ca":"Atlantic","fr":"Atlantique","gl":"Atlantico","it":"Atlantico","de":"Atlantik","pt":"Atlantico"},{"es":"Índico","en":"Indian","eu":"Indikoa","ca":"Indic","fr":"Indien","gl":"Indico","it":"Indiano","de":"Indischer Ozean","pt":"Indico"},{"es":"Pacífico","en":"Pacific","eu":"Ozeano Barea","ca":"Pacific","fr":"Pacifique","gl":"Pacifico","it":"Pacifico","de":"Pazifik","pt":"Pacifico"},{"es":"Ártico","en":"Arctic","eu":"Artikoa","ca":"Arctic","fr":"Arctique","gl":"Artico","it":"Artico","de":"Arktischer Ozean","pt":"Artico"}]'::jsonb,
  2, 'nature'
),
-- Q13 technology easy
(
  '{"es":"¿Quién es considerado el padre de la computación?","en":"Who is considered the father of computing?","eu":"Nor da konputazioaren aitatzat hartzen dena?","ca":"Qui es considerat el pare de la computacio?","fr":"Qui est considere comme le pere de l informatique?","gl":"Quen e considerado o pai da computación?","it":"Chi e considerato il padre dell informatica?","de":"Wer gilt als Vater der Informatik?","pt":"Quem e considerado o pai da computacao?"}'::jsonb,
  '[{"es":"Bill Gates","en":"Bill Gates","eu":"Bill Gates","ca":"Bill Gates","fr":"Bill Gates","gl":"Bill Gates","it":"Bill Gates","de":"Bill Gates","pt":"Bill Gates"},{"es":"Steve Jobs","en":"Steve Jobs","eu":"Steve Jobs","ca":"Steve Jobs","fr":"Steve Jobs","gl":"Steve Jobs","it":"Steve Jobs","de":"Steve Jobs","pt":"Steve Jobs"},{"es":"Alan Turing","en":"Alan Turing","eu":"Alan Turing","ca":"Alan Turing","fr":"Alan Turing","gl":"Alan Turing","it":"Alan Turing","de":"Alan Turing","pt":"Alan Turing"},{"es":"Nikola Tesla","en":"Nikola Tesla","eu":"Nikola Tesla","ca":"Nikola Tesla","fr":"Nikola Tesla","gl":"Nikola Tesla","it":"Nikola Tesla","de":"Nikola Tesla","pt":"Nikola Tesla"}]'::jsonb,
  2, 'technology'
),
-- Q14 literature easy
(
  '{"es":"¿Quién escribió Romeo y Julieta?","en":"Who wrote Romeo and Juliet?","eu":"Nork idatzi zuen Romeo eta Julieta?","ca":"Qui va escriure Romeo i Julieta?","fr":"Qui a ecrit Romeo et Juliette?","gl":"Quen escribiu Romeo e Xulieta?","it":"Chi ha scritto Romeo e Giulietta?","de":"Wer schrieb Romeo und Julia?","pt":"Quem escreveu Romeu e Julieta?"}'::jsonb,
  '[{"es":"Charles Dickens","en":"Charles Dickens","eu":"Charles Dickens","ca":"Charles Dickens","fr":"Charles Dickens","gl":"Charles Dickens","it":"Charles Dickens","de":"Charles Dickens","pt":"Charles Dickens"},{"es":"William Shakespeare","en":"William Shakespeare","eu":"William Shakespeare","ca":"William Shakespeare","fr":"William Shakespeare","gl":"William Shakespeare","it":"William Shakespeare","de":"William Shakespeare","pt":"William Shakespeare"},{"es":"Miguel de Cervantes","en":"Miguel de Cervantes","eu":"Miguel de Cervantes","ca":"Miguel de Cervantes","fr":"Miguel de Cervantes","gl":"Miguel de Cervantes","it":"Miguel de Cervantes","de":"Miguel de Cervantes","pt":"Miguel de Cervantes"},{"es":"Victor Hugo","en":"Victor Hugo","eu":"Victor Hugo","ca":"Victor Hugo","fr":"Victor Hugo","gl":"Victor Hugo","it":"Victor Hugo","de":"Victor Hugo","pt":"Victor Hugo"}]'::jsonb,
  1, 'literature'
),
-- Q15 sports easy
(
  '{"es":"¿Cuántos jugadores tiene un equipo de fútbol en el campo?","en":"How many players does a football team have on the field?","eu":"Zenbat jokalari ditu fútbol talde batek zelaian?","ca":"Quants jugadors te un equip de fútbol al camp?","fr":"Combien de joueurs une equipe de football a-t-elle sur le terrain?","gl":"Cantos xogadores ten un equipo de fútbol no campo?","it":"Quanti giocatori ha una squadra di calcio in campo?","de":"Wie viele Spieler hat eine Fussballmannschaft auf dem Feld?","pt":"Quantos jogadores tem uma equipa de futebol em campo?"}'::jsonb,
  '[{"es":"9","en":"9","eu":"9","ca":"9","fr":"9","gl":"9","it":"9","de":"9","pt":"9"},{"es":"10","en":"10","eu":"10","ca":"10","fr":"10","gl":"10","it":"10","de":"10","pt":"10"},{"es":"11","en":"11","eu":"11","ca":"11","fr":"11","gl":"11","it":"11","de":"11","pt":"11"},{"es":"12","en":"12","eu":"12","ca":"12","fr":"12","gl":"12","it":"12","de":"12","pt":"12"}]'::jsonb,
  2, 'sports'
),
-- Q16 art easy
(
  '{"es":"¿Quién pintó la Mona Lisa?","en":"Who painted the Mona Lisa?","eu":"Nork margotu zuen Mona Lisa?","ca":"Qui va pintar la Mona Lisa?","fr":"Qui a peint la Joconde?","gl":"Quen pintou a Mona Lisa?","it":"Chi ha dipintó la Gioconda?","de":"Wer hat die Mona Lisa gemalt?","pt":"Quem pintou a Mona Lisa?"}'::jsonb,
  '[{"es":"Miguel Ángel","en":"Michelangelo","eu":"Michelangelo","ca":"Miquel Angel","fr":"Michel-Ange","gl":"Miguel Anxo","it":"Michelangelo","de":"Michelangelo","pt":"Miguel Angelo"},{"es":"Leonardo da Vinci","en":"Leonardo da Vinci","eu":"Leonardo da Vinci","ca":"Leonardo da Vinci","fr":"Leonard de Vinci","gl":"Leonardo da Vinci","it":"Leonardo da Vinci","de":"Leonardo da Vinci","pt":"Leonardo da Vinci"},{"es":"Rafael","en":"Raphael","eu":"Rafael","ca":"Rafael","fr":"Raphael","gl":"Rafael","it":"Raffaello","de":"Raffael","pt":"Rafael"},{"es":"Botticelli","en":"Botticelli","eu":"Botticelli","ca":"Botticelli","fr":"Botticelli","gl":"Botticelli","it":"Botticelli","de":"Botticelli","pt":"Botticelli"}]'::jsonb,
  1, 'art'
),
-- Q17 geography easy
(
  '{"es":"¿Cuál es el continente más grande?","en":"What is the largest continent?","eu":"Zein da kontinenterik handiena?","ca":"Quin es el continent mes gran?","fr":"Quel est le plus grand continent?","gl":"Cal e o continente mais grande?","it":"Qual e il continente piu grande?","de":"Welcher ist der groesste Kontinent?","pt":"Qual e o maior continente?"}'::jsonb,
  '[{"es":"África","en":"Africa","eu":"Afrika","ca":"Africa","fr":"Afrique","gl":"Africa","it":"Africa","de":"Afrika","pt":"Africa"},{"es":"Europa","en":"Europe","eu":"Europa","ca":"Europa","fr":"Europe","gl":"Europa","it":"Europa","de":"Europa","pt":"Europa"},{"es":"Asia","en":"Asia","eu":"Asia","ca":"Asia","fr":"Asie","gl":"Asia","it":"Asia","de":"Asien","pt":"Asia"},{"es":"América","en":"America","eu":"Amerika","ca":"America","fr":"Amerique","gl":"America","it":"America","de":"Amerika","pt":"America"}]'::jsonb,
  2, 'geography'
),
-- Q18 science easy
(
  '{"es":"¿Cuál es el gas más abundante en la atmósfera terrestre?","en":"What is the most abundant gas in Earth s atmosphere?","eu":"Zein da Lurreko atmósferan gas ugariena?","ca":"Quin es el gas mes abundant a l atmósfera terrestre?","fr":"Quel est le gaz le plus abondant dans l atmosphere terrestre?","gl":"Cal e o gas mais abundante na atmósfera terrestre?","it":"Qual e il gas piu abbondante nell atmósfera terrestre?","de":"Welches ist das haeufigste Gas in der Erdatmosphaere?","pt":"Qual e o gas mais abundante na atmósfera terrestre?"}'::jsonb,
  '[{"es":"Oxígeno","en":"Oxygen","eu":"Oxigenoa","ca":"Oxigen","fr":"Oxygene","gl":"Osixeno","it":"Ossigeno","de":"Sauerstoff","pt":"Oxigenio"},{"es":"Nitrógeno","en":"Nitrogen","eu":"Nitrogenoa","ca":"Nitrogen","fr":"Azote","gl":"Nitroxeno","it":"Azoto","de":"Stickstoff","pt":"Nitrogenio"},{"es":"Hidrógeno","en":"Hydrogen","eu":"Hidrogenoa","ca":"Hidrogen","fr":"Hydrogene","gl":"Hidroxeno","it":"Idrogeno","de":"Wasserstoff","pt":"Hidrogenio"},{"es":"Dióxido de carbono","en":"Carbon dioxide","eu":"Karbono dioxidoa","ca":"Diòxid de carboni","fr":"Dioxyde de carbone","gl":"Dióxido de carbono","it":"Anidride carbonica","de":"Kohlendioxid","pt":"Dióxido de carbono"}]'::jsonb,
  1, 'science'
),
-- Q19 animals easy
(
  '{"es":"¿Cuál es el animal más grande del mundo?","en":"What is the largest animal in the world?","eu":"Zein da munduko animaliarik handiena?","ca":"Quin es l animal mes gran del mon?","fr":"Quel est le plus grand animal du monde?","gl":"Cal e o animal mais grande do mundo?","it":"Qual e l animale piu grande del mondo?","de":"Welches ist das groesste Tier der Welt?","pt":"Qual e o maior animal do mundo?"}'::jsonb,
  '[{"es":"Elefante africano","en":"African elephant","eu":"Elefante afrikarra","ca":"Elefant africa","fr":"Elephant d Afrique","gl":"Elefante africano","it":"Elefante africano","de":"Afrikanischer Elefant","pt":"Elefante africano"},{"es":"Ballena azul","en":"Blue whale","eu":"Balea urdina","ca":"Balena blava","fr":"Baleine bleue","gl":"Balea azul","it":"Balenottera azzurra","de":"Blauwal","pt":"Baleia azul"},{"es":"Jirafa","en":"Giraffe","eu":"Jirafa","ca":"Girafa","fr":"Girafe","gl":"Xirafa","it":"Giraffa","de":"Giraffe","pt":"Girafa"},{"es":"Tiburón ballena","en":"Whale shark","eu":"Balea-marrazoa","ca":"Tauró balena","fr":"Requin-baleine","gl":"Quenlla balea","it":"Squalo balena","de":"Walhai","pt":"Tubarao-baleia"}]'::jsonb,
  1, 'animals'
),
-- Q20 food easy
(
  '{"es":"¿De qué fruta se obtiene la sidra?","en":"From which fruit is cider made?","eu":"Zein frutatik lortzen da sagardoa?","ca":"De quina fruita s obte la sidra?","fr":"De quel fruit obtient-on le cidre?","gl":"De que froita se obten a sidra?","it":"Da quale frutto si ottiene il sidro?","de":"Aus welcher Frucht wird Apfelwein hergestellt?","pt":"De que fruta se obtem a sidra?"}'::jsonb,
  '[{"es":"Uva","en":"Grape","eu":"Mahatsa","ca":"Raim","fr":"Raisin","gl":"Uva","it":"Uva","de":"Traube","pt":"Uva"},{"es":"Pera","en":"Pear","eu":"Udarea","ca":"Pera","fr":"Poire","gl":"Pera","it":"Pera","de":"Birne","pt":"Pera"},{"es":"Manzana","en":"Apple","eu":"Sagarra","ca":"Poma","fr":"Pomme","gl":"Maza","it":"Mela","de":"Apfel","pt":"Maca"},{"es":"Naranja","en":"Orange","eu":"Laranja","ca":"Taronja","fr":"Orange","gl":"Laranxa","it":"Arancia","de":"Orange","pt":"Laranja"}]'::jsonb,
  2, 'food'
),
-- Q21 history easy
(
  '{"es":"¿Quién descubrió la penicilina?","en":"Who discovered penicillin?","eu":"Nork aurkitu zuen penizilina?","ca":"Qui va descobrir la penicil·lina?","fr":"Qui a decouvert la penicilline?","gl":"Quen descubriu a penicilina?","it":"Chi ha scoperto la penicillina?","de":"Wer hat das Penizillin entdeckt?","pt":"Quem descobriu a penicilina?"}'::jsonb,
  '[{"es":"Louis Pasteur","en":"Louis Pasteur","eu":"Louis Pasteur","ca":"Louis Pasteur","fr":"Louis Pasteur","gl":"Louis Pasteur","it":"Louis Pasteur","de":"Louis Pasteur","pt":"Louis Pasteur"},{"es":"Alexander Fleming","en":"Alexander Fleming","eu":"Alexander Fleming","ca":"Alexander Fleming","fr":"Alexander Fleming","gl":"Alexander Fleming","it":"Alexander Fleming","de":"Alexander Fleming","pt":"Alexander Fleming"},{"es":"Marie Curie","en":"Marie Curie","eu":"Marie Curie","ca":"Marie Curie","fr":"Marie Curie","gl":"Marie Curie","it":"Marie Curie","de":"Marie Curie","pt":"Marie Curie"},{"es":"Robert Koch","en":"Robert Koch","eu":"Robert Koch","ca":"Robert Koch","fr":"Robert Koch","gl":"Robert Koch","it":"Robert Koch","de":"Robert Koch","pt":"Robert Koch"}]'::jsonb,
  1, 'history'
),
-- Q22 landmarks easy
(
  '{"es":"¿En qué país se encuentran las pirámides de Giza?","en":"In which country are the Pyramids of Giza located?","eu":"Zein herrialdetan daude Gizako piramideak?","ca":"A quin pais es troben les pirámides de Giza?","fr":"Dans quel pays se trouvent les pyramides de Gizeh?","gl":"En que pais se atopan as pirámides de Giza?","it":"In quale paese si trovano le piramidi di Giza?","de":"In welchem Land befinden sich die Pyramiden von Gizeh?","pt":"Em que pais se encontram as pirámides de Giza?"}'::jsonb,
  '[{"es":"Irak","en":"Iraq","eu":"Irak","ca":"Iraq","fr":"Irak","gl":"Iraq","it":"Iraq","de":"Irak","pt":"Iraque"},{"es":"Egipto","en":"Egypt","eu":"Egipto","ca":"Egipte","fr":"Egypte","gl":"Exipto","it":"Egitto","de":"Aegypten","pt":"Egito"},{"es":"Turquía","en":"Turkey","eu":"Turkia","ca":"Turquía","fr":"Turquie","gl":"Turquía","it":"Turchia","de":"Tuerkei","pt":"Turquía"},{"es":"Jordania","en":"Jordan","eu":"Jordania","ca":"Jordania","fr":"Jordanie","gl":"Xordania","it":"Giordania","de":"Jordanien","pt":"Jordania"}]'::jsonb,
  1, 'landmarks'
),
-- Q23 body easy
(
  '{"es":"¿Cuál es el órgano más grande del cuerpo humano?","en":"What is the largest organ of the human body?","eu":"Zein da giza gorputzeko órganorik handiena?","ca":"Quin es l organ mes gran del cos huma?","fr":"Quel est le plus grand organe du corps humain?","gl":"Cal e o órgano mais grande do corpo humano?","it":"Qual e l órgano piu grande del corpo umano?","de":"Welches ist das groesste Organ des menschlichen Koerpers?","pt":"Qual e o maior orgao do corpo humano?"}'::jsonb,
  '[{"es":"Hígado","en":"Liver","eu":"Gibela","ca":"Fetge","fr":"Foie","gl":"Figado","it":"Fegato","de":"Leber","pt":"Figado"},{"es":"Cerebro","en":"Brain","eu":"Garuna","ca":"Cervell","fr":"Cerveau","gl":"Cerebro","it":"Cervello","de":"Gehirn","pt":"Cerebro"},{"es":"Piel","en":"Skin","eu":"Azala","ca":"Pell","fr":"Peau","gl":"Pel","it":"Pelle","de":"Haut","pt":"Pele"},{"es":"Corazón","en":"Heart","eu":"Bihotza","ca":"Cor","fr":"Coeur","gl":"Corazon","it":"Cuore","de":"Herz","pt":"Coracao"}]'::jsonb,
  2, 'body'
),
-- Q24 cinema easy
(
  '{"es":"¿En qué película aparece el personaje de Indiana Jones?","en":"In which film does the character Indiana Jones appear?","eu":"Zein filmetan agertzen da Indiana Jones pertsonaia?","ca":"A quina pel·licula apareix el personatge d Indiana Jones?","fr":"Dans quel film apparait le personnage d Indiana Jones?","gl":"En que película aparece a personaxe de Indiana Jones?","it":"In quale film appare il personaggio di Indiana Jones?","de":"In welchem Film kommt die Figur Indiana Jones vor?","pt":"Em que filme aparece a personagem Indiana Jones?"}'::jsonb,
  '[{"es":"El padrino","en":"The Godfather","eu":"Aitapontea","ca":"El padri","fr":"Le Parrain","gl":"O padriño","it":"Il Padrino","de":"Der Pate","pt":"O Padrinho"},{"es":"En busca del arca perdida","en":"Raiders of the Lost Ark","eu":"Arka galduaren bila","ca":"A la recerca de l arca perduda","fr":"Les Aventuriers de l arche perdue","gl":"En busca da arca perdida","it":"I predatori dell arca perduta","de":"Jaeger des verlorenen Schatzes","pt":"Os Cacadores da Arca Perdida"},{"es":"Star Wars","en":"Star Wars","eu":"Star Wars","ca":"Star Wars","fr":"Star Wars","gl":"Star Wars","it":"Star Wars","de":"Star Wars","pt":"Star Wars"},{"es":"Matrix","en":"The Matrix","eu":"Matrix","ca":"Matrix","fr":"Matrix","gl":"Matrix","it":"Matrix","de":"Matrix","pt":"Matrix"}]'::jsonb,
  1, 'cinema'
),
-- Q25 music easy
(
  '{"es":"¿Cuántas cuerdas tiene una guitarra clásica?","en":"How many strings does a classical guitar have?","eu":"Zenbat soka ditu gitarra klasiko batek?","ca":"Quantes cordes te una guitarra classica?","fr":"Combien de cordes a une guitare classique?","gl":"Cantas cordas ten unha guitarra clásica?","it":"Quante corde ha una chitarra classica?","de":"Wie viele Saiten hat eine klassische Gitarre?","pt":"Quantas cordas tem uma guitarra classica?"}'::jsonb,
  '[{"es":"4","en":"4","eu":"4","ca":"4","fr":"4","gl":"4","it":"4","de":"4","pt":"4"},{"es":"5","en":"5","eu":"5","ca":"5","fr":"5","gl":"5","it":"5","de":"5","pt":"5"},{"es":"6","en":"6","eu":"6","ca":"6","fr":"6","gl":"6","it":"6","de":"6","pt":"6"},{"es":"8","en":"8","eu":"8","ca":"8","fr":"8","gl":"8","it":"8","de":"8","pt":"8"}]'::jsonb,
  2, 'music'
),
-- Q26 geography medium
(
  '{"es":"¿Cuál es el desierto más grande del mundo?","en":"What is the largest desert in the world?","eu":"Zein da munduko basamorturik handiena?","ca":"Quin es el desert mes gran del mon?","fr":"Quel est le plus grand desert du monde?","gl":"Cal e o deserto mais grande do mundo?","it":"Qual e il deserto piu grande del mondo?","de":"Welche ist die groesste Wueste der Welt?","pt":"Qual e o maior deserto do mundo?"}'::jsonb,
  '[{"es":"Sahara","en":"Sahara","eu":"Sahara","ca":"Sahara","fr":"Sahara","gl":"Sahara","it":"Sahara","de":"Sahara","pt":"Sahara"},{"es":"Antartico","en":"Antarctic","eu":"Antartikoa","ca":"Antarctic","fr":"Antarctique","gl":"Antartico","it":"Antartico","de":"Antarktis","pt":"Antartico"},{"es":"Gobi","en":"Gobi","eu":"Gobi","ca":"Gobi","fr":"Gobi","gl":"Gobi","it":"Gobi","de":"Gobi","pt":"Gobi"},{"es":"Arabigo","en":"Arabian","eu":"Arabiarra","ca":"Arabic","fr":"Arabique","gl":"Arabigo","it":"Arabico","de":"Arabische Wueste","pt":"Arabico"}]'::jsonb,
  1, 'geography'
),
-- Q27 science medium
(
  '{"es":"¿Cuál es la velocidad de la luz en km/s aproximadamente?","en":"What is the speed of light in km/s approximately?","eu":"Zein da argiaren abiadura km/s-tan gutxi gorabehera?","ca":"Quina es la velocitat de la llum en km/s aproximadament?","fr":"Quelle est la vitesse de la lumiere en km/s environ?","gl":"Cal e a velocidade da luz en km/s aproximadamente?","it":"Qual e la velocita della luce in km/s approssimativamente?","de":"Wie hoch ist die Lichtgeschwindigkeit in km/s ungefaehr?","pt":"Qual e a velocidade da luz em km/s aproximadamente?"}'::jsonb,
  '[{"es":"150 000","en":"150 000","eu":"150 000","ca":"150 000","fr":"150 000","gl":"150 000","it":"150 000","de":"150 000","pt":"150 000"},{"es":"300 000","en":"300 000","eu":"300 000","ca":"300 000","fr":"300 000","gl":"300 000","it":"300 000","de":"300 000","pt":"300 000"},{"es":"500 000","en":"500 000","eu":"500 000","ca":"500 000","fr":"500 000","gl":"500 000","it":"500 000","de":"500 000","pt":"500 000"},{"es":"1 000 000","en":"1 000 000","eu":"1 000 000","ca":"1 000 000","fr":"1 000 000","gl":"1 000 000","it":"1 000 000","de":"1 000 000","pt":"1 000 000"}]'::jsonb,
  1, 'science'
),
-- Q28 history medium
(
  '{"es":"¿En qué año cayó el Muro de Berlín?","en":"In what year did the Berlin Wall fall?","eu":"Zein urtetan erori zen Berlingo Harresia?","ca":"En quin any va caure el Mur de Berlin?","fr":"En quelle annee le Mur de Berlin est-il tombe?","gl":"En que ano caeu o Muro de Berlín?","it":"In che anno e caduto il Muro di Berlino?","de":"In welchem Jahr fiel die Berliner Mauer?","pt":"Em que ano caiu o Muro de Berlim?"}'::jsonb,
  '[{"es":"1987","en":"1987","eu":"1987","ca":"1987","fr":"1987","gl":"1987","it":"1987","de":"1987","pt":"1987"},{"es":"1989","en":"1989","eu":"1989","ca":"1989","fr":"1989","gl":"1989","it":"1989","de":"1989","pt":"1989"},{"es":"1991","en":"1991","eu":"1991","ca":"1991","fr":"1991","gl":"1991","it":"1991","de":"1991","pt":"1991"},{"es":"1985","en":"1985","eu":"1985","ca":"1985","fr":"1985","gl":"1985","it":"1985","de":"1985","pt":"1985"}]'::jsonb,
  1, 'history'
),
-- Q29 space medium
(
  '{"es":"¿Cuántos planetas tiene el sistema solar?","en":"How many planets does the solar system have?","eu":"Zenbat planeta ditu eguzki-sistemak?","ca":"Quants planetes te el sistema solar?","fr":"Combien de planetes compte le systeme solaire?","gl":"Cantos planetas ten o sistema solar?","it":"Quanti pianeti ha il sistema solare?","de":"Wie viele Planeten hat das Sonnensystem?","pt":"Quantos planetas tem o sistema solar?"}'::jsonb,
  '[{"es":"7","en":"7","eu":"7","ca":"7","fr":"7","gl":"7","it":"7","de":"7","pt":"7"},{"es":"8","en":"8","eu":"8","ca":"8","fr":"8","gl":"8","it":"8","de":"8","pt":"8"},{"es":"9","en":"9","eu":"9","ca":"9","fr":"9","gl":"9","it":"9","de":"9","pt":"9"},{"es":"10","en":"10","eu":"10","ca":"10","fr":"10","gl":"10","it":"10","de":"10","pt":"10"}]'::jsonb,
  1, 'space'
),
-- Q30 animals medium
(
  '{"es":"¿Cuántas patas tiene una araña?","en":"How many legs does a spider have?","eu":"Zenbat hanka ditu armiarma batek?","ca":"Quantes potes te una aranya?","fr":"Combien de pattes a une araignee?","gl":"Cantas patas ten unha arana?","it":"Quante zampe ha un ragno?","de":"Wie viele Beine hat eine Spinne?","pt":"Quantas patas tem uma aranha?"}'::jsonb,
  '[{"es":"6","en":"6","eu":"6","ca":"6","fr":"6","gl":"6","it":"6","de":"6","pt":"6"},{"es":"8","en":"8","eu":"8","ca":"8","fr":"8","gl":"8","it":"8","de":"8","pt":"8"},{"es":"10","en":"10","eu":"10","ca":"10","fr":"10","gl":"10","it":"10","de":"10","pt":"10"},{"es":"12","en":"12","eu":"12","ca":"12","fr":"12","gl":"12","it":"12","de":"12","pt":"12"}]'::jsonb,
  1, 'animals'
),
-- Q31 technology medium
(
  '{"es":"¿En qué década se inventó Internet?","en":"In which decade was the Internet invented?","eu":"Zein hamarkadan asmatu zen Internet?","ca":"En quina década es va inventar Internet?","fr":"Dans quelle decennie Internet a-t-il ete invente?","gl":"En que década se inventou Internet?","it":"In quale decennio e stato inventato Internet?","de":"In welchem Jahrzehnt wurde das Internet erfunden?","pt":"Em que década foi inventada a Internet?"}'::jsonb,
  '[{"es":"1950","en":"1950s","eu":"1950eko hamarkada","ca":"1950","fr":"1950","gl":"1950","it":"1950","de":"1950er","pt":"1950"},{"es":"1960","en":"1960s","eu":"1960ko hamarkada","ca":"1960","fr":"1960","gl":"1960","it":"1960","de":"1960er","pt":"1960"},{"es":"1970","en":"1970s","eu":"1970eko hamarkada","ca":"1970","fr":"1970","gl":"1970","it":"1970","de":"1970er","pt":"1970"},{"es":"1980","en":"1980s","eu":"1980ko hamarkada","ca":"1980","fr":"1980","gl":"1980","it":"1980","de":"1980er","pt":"1980"}]'::jsonb,
  1, 'technology'
),
-- Q32 literature medium
(
  '{"es":"¿Quién escribió Don Quijote de la Mancha?","en":"Who wrote Don Quixote?","eu":"Nork idatzi zuen Don Kixote Mantxakoa?","ca":"Qui va escriure Don Quixot de la Manxa?","fr":"Qui a ecrit Don Quichotte?","gl":"Quen escribiu Don Quixote da Mancha?","it":"Chi ha scritto Don Chisciotte della Mancia?","de":"Wer schrieb Don Quijote?","pt":"Quem escreveu Dom Quixote?"}'::jsonb,
  '[{"es":"Lope de Vega","en":"Lope de Vega","eu":"Lope de Vega","ca":"Lope de Vega","fr":"Lope de Vega","gl":"Lope de Vega","it":"Lope de Vega","de":"Lope de Vega","pt":"Lope de Vega"},{"es":"Miguel de Cervantes","en":"Miguel de Cervantes","eu":"Miguel de Cervantes","ca":"Miguel de Cervantes","fr":"Miguel de Cervantes","gl":"Miguel de Cervantes","it":"Miguel de Cervantes","de":"Miguel de Cervantes","pt":"Miguel de Cervantes"},{"es":"Federico Garcia Lorca","en":"Federico Garcia Lorca","eu":"Federico Garcia Lorca","ca":"Federico Garcia Lorca","fr":"Federico Garcia Lorca","gl":"Federico Garcia Lorca","it":"Federico Garcia Lorca","de":"Federico Garcia Lorca","pt":"Federico Garcia Lorca"},{"es":"Gabriel Garcia Marquez","en":"Gabriel Garcia Marquez","eu":"Gabriel Garcia Marquez","ca":"Gabriel Garcia Marquez","fr":"Gabriel Garcia Marquez","gl":"Gabriel Garcia Marquez","it":"Gabriel Garcia Marquez","de":"Gabriel Garcia Marquez","pt":"Gabriel Garcia Marquez"}]'::jsonb,
  1, 'literature'
),
-- Q33 sports medium
(
  '{"es":"¿En qué deporte se usa un shuttlecock?","en":"In which sport is a shuttlecock used?","eu":"Zein kiroletan erabiltzen da shuttlecock-a?","ca":"En quin esport s utilitza un volant?","fr":"Dans quel sport utilise-t-on un volant?","gl":"En que deporte se usa un volante?","it":"In quale sport si usa un volano?","de":"In welcher Sportart wird ein Federball verwendet?","pt":"Em que desporto se usa uma peteca?"}'::jsonb,
  '[{"es":"Tenis","en":"Tennis","eu":"Tenisa","ca":"Tennis","fr":"Tennis","gl":"Tenis","it":"Tennis","de":"Tennis","pt":"Tenis"},{"es":"Badminton","en":"Badminton","eu":"Badmintona","ca":"Badminton","fr":"Badminton","gl":"Badminton","it":"Badminton","de":"Badminton","pt":"Badminton"},{"es":"Squash","en":"Squash","eu":"Squash","ca":"Squash","fr":"Squash","gl":"Squash","it":"Squash","de":"Squash","pt":"Squash"},{"es":"Ping pong","en":"Table tennis","eu":"Ping pong","ca":"Ping pong","fr":"Ping-pong","gl":"Ping pong","it":"Ping pong","de":"Tischtennis","pt":"Ping pong"}]'::jsonb,
  1, 'sports'
),
-- Q34 art medium
(
  '{"es":"¿Quién pintó La noche estrellada?","en":"Who painted The Starry Night?","eu":"Nork margotu zuen Gau izartsua?","ca":"Qui va pintar La nit estelada?","fr":"Qui a peint La Nuit etoilee?","gl":"Quen pintou A noite estrelada?","it":"Chi ha dipinto Notte stellata?","de":"Wer hat die Sternennacht gemalt?","pt":"Quem pintou A Noite Estrelada?"}'::jsonb,
  '[{"es":"Claude Monet","en":"Claude Monet","eu":"Claude Monet","ca":"Claude Monet","fr":"Claude Monet","gl":"Claude Monet","it":"Claude Monet","de":"Claude Monet","pt":"Claude Monet"},{"es":"Pablo Picasso","en":"Pablo Picasso","eu":"Pablo Picasso","ca":"Pablo Picasso","fr":"Pablo Picasso","gl":"Pablo Picasso","it":"Pablo Picasso","de":"Pablo Picasso","pt":"Pablo Picasso"},{"es":"Vincent van Gogh","en":"Vincent van Gogh","eu":"Vincent van Gogh","ca":"Vincent van Gogh","fr":"Vincent van Gogh","gl":"Vincent van Gogh","it":"Vincent van Gogh","de":"Vincent van Gogh","pt":"Vincent van Gogh"},{"es":"Salvador Dali","en":"Salvador Dali","eu":"Salvador Dali","ca":"Salvador Dali","fr":"Salvador Dali","gl":"Salvador Dali","it":"Salvador Dali","de":"Salvador Dali","pt":"Salvador Dali"}]'::jsonb,
  2, 'art'
),
-- Q35 nature medium
(
  '{"es":"¿Cuál es la montaña más alta del mundo?","en":"What is the tallest mountain in the world?","eu":"Zein da munduko mendirik altuena?","ca":"Quina es la muntanya mes alta del mon?","fr":"Quelle est la montagne la plus haute du monde?","gl":"Cal e a montaña mais alta do mundo?","it":"Qual e la montagna piu alta del mondo?","de":"Welcher ist der hoechste Berg der Welt?","pt":"Qual e a montanha mais alta do mundo?"}'::jsonb,
  '[{"es":"K2","en":"K2","eu":"K2","ca":"K2","fr":"K2","gl":"K2","it":"K2","de":"K2","pt":"K2"},{"es":"Kangchenjunga","en":"Kangchenjunga","eu":"Kangchenjunga","ca":"Kangchenjunga","fr":"Kangchenjunga","gl":"Kangchenjunga","it":"Kangchenjunga","de":"Kangchendzoenga","pt":"Kangchenjunga"},{"es":"Everest","en":"Everest","eu":"Everest","ca":"Everest","fr":"Everest","gl":"Everest","it":"Everest","de":"Mount Everest","pt":"Everest"},{"es":"Makalu","en":"Makalu","eu":"Makalu","ca":"Makalu","fr":"Makalu","gl":"Makalu","it":"Makalu","de":"Makalu","pt":"Makalu"}]'::jsonb,
  2, 'nature'
),
-- Q36 food medium
(
  '{"es":"¿De qué region es originario el chocolate?","en":"From which region does chocolate originate?","eu":"Zein eskualdetik dator txokolatea jatorriz?","ca":"De quina regio es originari el xocolata?","fr":"De quelle region le chocolat est-il originaire?","gl":"De que rexion e orixinario o chocolate?","it":"Da quale regione ha origine il cioccolato?","de":"Aus welcher Region stammt Schokolade?","pt":"De que regiao e originario o chocolate?"}'::jsonb,
  '[{"es":"Europa","en":"Europe","eu":"Europa","ca":"Europa","fr":"Europe","gl":"Europa","it":"Europa","de":"Europa","pt":"Europa"},{"es":"Mesoamerica","en":"Mesoamerica","eu":"Mesoamerika","ca":"Mesoamerica","fr":"Mesoamerique","gl":"Mesoamerica","it":"Mesoamerica","de":"Mesoamerika","pt":"Mesoamerica"},{"es":"Asia","en":"Asia","eu":"Asia","ca":"Asia","fr":"Asie","gl":"Asia","it":"Asia","de":"Asien","pt":"Asia"},{"es":"África","en":"Africa","eu":"Afrika","ca":"Africa","fr":"Afrique","gl":"Africa","it":"Africa","de":"Afrika","pt":"Africa"}]'::jsonb,
  1, 'food'
),
-- Q37 body medium
(
  '{"es":"¿Cuál es el hueso más largo del cuerpo humano?","en":"What is the longest bone in the human body?","eu":"Zein da giza gorputzeko hezurrik luzeena?","ca":"Quin es l os mes llarg del cos huma?","fr":"Quel est l os le plus long du corps humain?","gl":"Cal e o oso mais longo do corpo humano?","it":"Qual e l osso piu lungo del corpo umano?","de":"Welcher ist der laengste Knochen im menschlichen Koerper?","pt":"Qual e o osso mais longo do corpo humano?"}'::jsonb,
  '[{"es":"Húmero","en":"Humerus","eu":"Humeroa","ca":"Humer","fr":"Humerus","gl":"Humero","it":"Omero","de":"Oberarmknochen","pt":"Umero"},{"es":"Tibia","en":"Tibia","eu":"Tibia","ca":"Tibia","fr":"Tibia","gl":"Tibia","it":"Tibia","de":"Schienbein","pt":"Tibia"},{"es":"Fémur","en":"Femur","eu":"Femurra","ca":"Femur","fr":"Femur","gl":"Femur","it":"Femore","de":"Oberschenkelknochen","pt":"Femur"},{"es":"Radio","en":"Radius","eu":"Erradioa","ca":"Radi","fr":"Radius","gl":"Radio","it":"Radio","de":"Speiche","pt":"Radio"}]'::jsonb,
  2, 'body'
),
-- Q38 cinema medium
(
  '{"es":"¿Quién dirigió la trilogía de El Señor de los Anillos?","en":"Who directed The Lord of the Rings trilogy?","eu":"Nork zuzendu zuen Eraztunen Jauna trilogia?","ca":"Qui va dirigir la trilogia del Senyor dels Anells?","fr":"Qui a realise la trilogie du Seigneur des Anneaux?","gl":"Quen dirixiu a triloxia do Senor dos Aneis?","it":"Chi ha diretto la trilogia de Il Signore degli Anelli?","de":"Wer hat die Herr-der-Ringe-Trilogie gedreht?","pt":"Quem dirigiu a trilogia de O Senhor dos Aneis?"}'::jsonb,
  '[{"es":"Steven Spielberg","en":"Steven Spielberg","eu":"Steven Spielberg","ca":"Steven Spielberg","fr":"Steven Spielberg","gl":"Steven Spielberg","it":"Steven Spielberg","de":"Steven Spielberg","pt":"Steven Spielberg"},{"es":"Peter Jackson","en":"Peter Jackson","eu":"Peter Jackson","ca":"Peter Jackson","fr":"Peter Jackson","gl":"Peter Jackson","it":"Peter Jackson","de":"Peter Jackson","pt":"Peter Jackson"},{"es":"Christopher Nolan","en":"Christopher Nolan","eu":"Christopher Nolan","ca":"Christopher Nolan","fr":"Christopher Nolan","gl":"Christopher Nolan","it":"Christopher Nolan","de":"Christopher Nolan","pt":"Christopher Nolan"},{"es":"Ridley Scott","en":"Ridley Scott","eu":"Ridley Scott","ca":"Ridley Scott","fr":"Ridley Scott","gl":"Ridley Scott","it":"Ridley Scott","de":"Ridley Scott","pt":"Ridley Scott"}]'::jsonb,
  1, 'cinema'
),
-- Q39 music medium
(
  '{"es":"¿Qué instrumento tocaba Beethoven?","en":"What instrument did Beethoven play?","eu":"Zein instrumentu jotzen zuen Beethoven-ek?","ca":"Quin instrument tocava Beethoven?","fr":"De quel instrument jouait Beethoven?","gl":"Que instrumento tocaba Beethoven?","it":"Quale strumento suonava Beethoven?","de":"Welches Instrument spielte Beethoven?","pt":"Que instrumento tocava Beethoven?"}'::jsonb,
  '[{"es":"Violín","en":"Violin","eu":"Biolina","ca":"Violi","fr":"Violon","gl":"Violin","it":"Violino","de":"Geige","pt":"Violino"},{"es":"Piano","en":"Piano","eu":"Pianoa","ca":"Piano","fr":"Piano","gl":"Piano","it":"Pianoforte","de":"Klavier","pt":"Piano"},{"es":"Flauta","en":"Flute","eu":"Txirula","ca":"Flauta","fr":"Flute","gl":"Frauta","it":"Flauto","de":"Floete","pt":"Flauta"},{"es":"Guitarra","en":"Guitar","eu":"Gitarra","ca":"Guitarra","fr":"Guitare","gl":"Guitarra","it":"Chitarra","de":"Gitarre","pt":"Guitarra"}]'::jsonb,
  1, 'music'
),
-- Q40 landmarks medium
(
  '{"es":"¿En qué ciudad se encuentra el Coliseo?","en":"In which city is the Colosseum located?","eu":"Zein hiritan dago Koloseoa?","ca":"A quina ciutat es troba el Colosseu?","fr":"Dans quelle ville se trouve le Colisee?","gl":"En que cidade esta o Coliseo?","it":"In quale citta si trova il Colosseo?","de":"In welcher Stadt befindet sich das Kolosseum?","pt":"Em que cidade se encontra o Coliseu?"}'::jsonb,
  '[{"es":"Atenas","en":"Athens","eu":"Atenas","ca":"Atenes","fr":"Athenes","gl":"Atenas","it":"Atene","de":"Athen","pt":"Atenas"},{"es":"Roma","en":"Rome","eu":"Erroma","ca":"Roma","fr":"Rome","gl":"Roma","it":"Roma","de":"Rom","pt":"Roma"},{"es":"Estambul","en":"Istanbul","eu":"Istanbul","ca":"Istanbul","fr":"Istanbul","gl":"Istambul","it":"Istanbul","de":"Istanbul","pt":"Istambul"},{"es":"El Cairo","en":"Cairo","eu":"Kairo","ca":"El Caire","fr":"Le Caire","gl":"O Cairo","it":"Il Cairo","de":"Kairo","pt":"Cairo"}]'::jsonb,
  1, 'landmarks'
),
-- Q41 science medium
(
  '{"es":"¿Qué tipo de animal es una ballena?","en":"What type of animal is a whale?","eu":"Zer animalia mota da balea?","ca":"Quin tipus d animal es una balena?","fr":"Quel type d animal est une baleine?","gl":"Que tipo de animal e unha balea?","it":"Che tipo di animale e una balena?","de":"Was fuer ein Tier ist ein Wal?","pt":"Que tipo de animal e uma baleia?"}'::jsonb,
  '[{"es":"Pez","en":"Fish","eu":"Arraina","ca":"Peix","fr":"Poisson","gl":"Peixe","it":"Pesce","de":"Fisch","pt":"Peixe"},{"es":"Reptil","en":"Reptile","eu":"Narrastia","ca":"Reptil","fr":"Reptile","gl":"Reptil","it":"Rettile","de":"Reptil","pt":"Reptil"},{"es":"Mamífero","en":"Mammal","eu":"Ugaztuna","ca":"Mamifer","fr":"Mammifere","gl":"Mamifero","it":"Mammifero","de":"Saeugetier","pt":"Mamifero"},{"es":"Anfibio","en":"Amphibian","eu":"Anfibioa","ca":"Amfibi","fr":"Amphibien","gl":"Anfibio","it":"Anfibio","de":"Amphibie","pt":"Anfibio"}]'::jsonb,
  2, 'animals'
),
-- Q42 geography medium
(
  '{"es":"¿Cuál es el país más grande del mundo por superficie?","en":"What is the largest country in the world by area?","eu":"Zein da munduko herrialderik handiena azaleraz?","ca":"Quin es el pais mes gran del mon per superficie?","fr":"Quel est le plus grand pays du monde par superficie?","gl":"Cal e o pais mais grande do mundo por superficie?","it":"Qual e il paese piu grande del mondo per superficie?","de":"Welches ist das flaechenmaessig groesste Land der Welt?","pt":"Qual e o maior pais do mundo por superficie?"}'::jsonb,
  '[{"es":"China","en":"China","eu":"Txina","ca":"Xina","fr":"Chine","gl":"China","it":"Cina","de":"China","pt":"China"},{"es":"Estados Unidos","en":"United States","eu":"Amerikako Estatu Batuak","ca":"Estats Units","fr":"Etats-Unis","gl":"Estados Unidos","it":"Stati Uniti","de":"Vereinigte Staaten","pt":"Estados Unidos"},{"es":"Rusia","en":"Russia","eu":"Errusia","ca":"Russia","fr":"Russie","gl":"Rusia","it":"Russia","de":"Russland","pt":"Russia"},{"es":"Canada","en":"Canada","eu":"Kanada","ca":"Canada","fr":"Canada","gl":"Canada","it":"Canada","de":"Kanada","pt":"Canada"}]'::jsonb,
  2, 'geography'
),
-- Q43 space medium
(
  '{"es":"¿Cuál es el planeta conocido como el planeta rojo?","en":"Which planet is known as the red planet?","eu":"Zein planeta da planeta gorria bezala ezagutzen dena?","ca":"Quin planeta es conegut com el planeta vermell?","fr":"Quelle planete est connue comme la planete rouge?","gl":"Cal e o planeta conecido como o planeta vermello?","it":"Quale pianeta e conosciuto come il pianeta rosso?","de":"Welcher Planet ist als der rote Planet bekannt?","pt":"Qual planeta e conhecido como o planeta vermelho?"}'::jsonb,
  '[{"es":"Venus","en":"Venus","eu":"Artizarra","ca":"Venus","fr":"Venus","gl":"Venus","it":"Venere","de":"Venus","pt":"Venus"},{"es":"Júpiter","en":"Jupiter","eu":"Jupiter","ca":"Jupiter","fr":"Jupiter","gl":"Xupiter","it":"Giove","de":"Jupiter","pt":"Jupiter"},{"es":"Marte","en":"Mars","eu":"Marte","ca":"Mart","fr":"Mars","gl":"Marte","it":"Marte","de":"Mars","pt":"Marte"},{"es":"Saturno","en":"Saturn","eu":"Saturno","ca":"Saturn","fr":"Saturne","gl":"Saturno","it":"Saturno","de":"Saturn","pt":"Saturno"}]'::jsonb,
  2, 'space'
),
-- Q44 history medium
(
  '{"es":"¿Quién fue el primer presidente de Estados Unidos?","en":"Who was the first president of the United States?","eu":"Nor izan zen Amerikako Estatu Batuetako lehen presidentea?","ca":"Qui va ser el primer president dels Estats Units?","fr":"Qui fut le premier president des Etats-Unis?","gl":"Quen foi o primeiro presidente dos Estados Unidos?","it":"Chi fu il primo presidente degli Stati Uniti?","de":"Wer war der erste Praesident der Vereinigten Staaten?","pt":"Quem foi o primeiro presidente dos Estados Unidos?"}'::jsonb,
  '[{"es":"Thomas Jefferson","en":"Thomas Jefferson","eu":"Thomas Jefferson","ca":"Thomas Jefferson","fr":"Thomas Jefferson","gl":"Thomas Jefferson","it":"Thomas Jefferson","de":"Thomas Jefferson","pt":"Thomas Jefferson"},{"es":"George Washington","en":"George Washington","eu":"George Washington","ca":"George Washington","fr":"George Washington","gl":"George Washington","it":"George Washington","de":"George Washington","pt":"George Washington"},{"es":"Abraham Lincoln","en":"Abraham Lincoln","eu":"Abraham Lincoln","ca":"Abraham Lincoln","fr":"Abraham Lincoln","gl":"Abraham Lincoln","it":"Abraham Lincoln","de":"Abraham Lincoln","pt":"Abraham Lincoln"},{"es":"John Adams","en":"John Adams","eu":"John Adams","ca":"John Adams","fr":"John Adams","gl":"John Adams","it":"John Adams","de":"John Adams","pt":"John Adams"}]'::jsonb,
  1, 'history'
),
-- Q45 technology medium
(
  '{"es":"¿Qué empresa creó el iPhone?","en":"Which company created the iPhone?","eu":"Zein enpresak sortu zuen iPhonea?","ca":"Quina empresa va crear l iPhone?","fr":"Quelle entreprise a cree l iPhone?","gl":"Que empresa creou o iPhone?","it":"Quale azienda ha creato l iPhone?","de":"Welches Unternehmen hat das iPhone entwickelt?","pt":"Que empresa criou o iPhone?"}'::jsonb,
  '[{"es":"Samsung","en":"Samsung","eu":"Samsung","ca":"Samsung","fr":"Samsung","gl":"Samsung","it":"Samsung","de":"Samsung","pt":"Samsung"},{"es":"Google","en":"Google","eu":"Google","ca":"Google","fr":"Google","gl":"Google","it":"Google","de":"Google","pt":"Google"},{"es":"Apple","en":"Apple","eu":"Apple","ca":"Apple","fr":"Apple","gl":"Apple","it":"Apple","de":"Apple","pt":"Apple"},{"es":"Microsoft","en":"Microsoft","eu":"Microsoft","ca":"Microsoft","fr":"Microsoft","gl":"Microsoft","it":"Microsoft","de":"Microsoft","pt":"Microsoft"}]'::jsonb,
  2, 'technology'
),
-- Q46 nature medium
(
  '{"es":"¿Cuál es el lago más grande del mundo?","en":"What is the largest lake in the world?","eu":"Zein da munduko aintzirarik handiena?","ca":"Quin es el llac mes gran del mon?","fr":"Quel est le plus grand lac du monde?","gl":"Cal e o lago mais grande do mundo?","it":"Qual e il lago piu grande del mondo?","de":"Welcher ist der groesste See der Welt?","pt":"Qual e o maior lago do mundo?"}'::jsonb,
  '[{"es":"Lago Superior","en":"Lake Superior","eu":"Goiko Aintzira","ca":"Llac Superior","fr":"Lac Superieur","gl":"Lago Superior","it":"Lago Superiore","de":"Oberer See","pt":"Lago Superior"},{"es":"Mar Caspio","en":"Caspian Sea","eu":"Kaspiar Itsasoa","ca":"Mar Caspia","fr":"Mer Caspienne","gl":"Mar Caspio","it":"Mar Caspio","de":"Kaspisches Meer","pt":"Mar Caspio"},{"es":"Lago Victoria","en":"Lake Victoria","eu":"Victoria Aintzira","ca":"Llac Victoria","fr":"Lac Victoria","gl":"Lago Victoria","it":"Lago Vittoria","de":"Viktoriasee","pt":"Lago Vitoria"},{"es":"Lago Baikal","en":"Lake Baikal","eu":"Baikal Aintzira","ca":"Llac Baikal","fr":"Lac Baikal","gl":"Lago Baikal","it":"Lago Baikal","de":"Baikalsee","pt":"Lago Baikal"}]'::jsonb,
  1, 'nature'
),
-- Q47 food medium
(
  '{"es":"¿Cuál es el ingrediente principal del guacamole?","en":"What is the main ingredient of guacamole?","eu":"Zein da guacamolearen osagai nagusia?","ca":"Quin es l ingredient principal del guacamole?","fr":"Quel est l ingredient principal du guacamole?","gl":"Cal e o ingrediente principal do guacamole?","it":"Qual e l ingrediente principale del guacamole?","de":"Was ist die Hauptzutat von Guacamole?","pt":"Qual e o ingrediente principal do guacamole?"}'::jsonb,
  '[{"es":"Tomate","en":"Tomato","eu":"Tomatea","ca":"Tomaquet","fr":"Tomate","gl":"Tomate","it":"Pomodoro","de":"Tomate","pt":"Tomate"},{"es":"Aguacate","en":"Avocado","eu":"Ahuakatea","ca":"Alvocat","fr":"Avocat","gl":"Aguacate","it":"Avocado","de":"Avocado","pt":"Abacate"},{"es":"Cebolla","en":"Onion","eu":"Tipula","ca":"Ceba","fr":"Oignon","gl":"Cebola","it":"Cipolla","de":"Zwiebel","pt":"Cebola"},{"es":"Pimiento","en":"Pepper","eu":"Piperra","ca":"Pebrot","fr":"Poivron","gl":"Pemento","it":"Peperone","de":"Paprika","pt":"Pimento"}]'::jsonb,
  1, 'food'
),
-- Q48 body medium
(
  '{"es":"¿Cuántas camaras tiene el corazón humano?","en":"How many chambers does the human heart have?","eu":"Zenbat ganbera ditu giza bihotzak?","ca":"Quantes cambres te el cor huma?","fr":"Combien de cavites possede le coeur humain?","gl":"Cantas camaras ten o corazón humano?","it":"Quante camere ha il cuore umano?","de":"Wie viele Kammern hat das menschliche Herz?","pt":"Quantas camaras tem o coracao humano?"}'::jsonb,
  '[{"es":"2","en":"2","eu":"2","ca":"2","fr":"2","gl":"2","it":"2","de":"2","pt":"2"},{"es":"3","en":"3","eu":"3","ca":"3","fr":"3","gl":"3","it":"3","de":"3","pt":"3"},{"es":"4","en":"4","eu":"4","ca":"4","fr":"4","gl":"4","it":"4","de":"4","pt":"4"},{"es":"5","en":"5","eu":"5","ca":"5","fr":"5","gl":"5","it":"5","de":"5","pt":"5"}]'::jsonb,
  2, 'body'
),
-- Q49 cinema medium
(
  '{"es":"¿En qué año se estrenó la primera película de Star Wars?","en":"In what year was the first Star Wars movie released?","eu":"Zein urtetan estreinatu zen Star Wars-en lehen filma?","ca":"En quin any es va estrenar la primera pel·licula de Star Wars?","fr":"En quelle annee le premier film Star Wars est-il sorti?","gl":"En que ano se estreou a primeira película de Star Wars?","it":"In che anno e uscito il primo film di Star Wars?","de":"In welchem Jahr wurde der erste Star-Wars-Film veroeffentlicht?","pt":"Em que ano foi lancado o primeiro filme de Star Wars?"}'::jsonb,
  '[{"es":"1975","en":"1975","eu":"1975","ca":"1975","fr":"1975","gl":"1975","it":"1975","de":"1975","pt":"1975"},{"es":"1977","en":"1977","eu":"1977","ca":"1977","fr":"1977","gl":"1977","it":"1977","de":"1977","pt":"1977"},{"es":"1980","en":"1980","eu":"1980","ca":"1980","fr":"1980","gl":"1980","it":"1980","de":"1980","pt":"1980"},{"es":"1983","en":"1983","eu":"1983","ca":"1983","fr":"1983","gl":"1983","it":"1983","de":"1983","pt":"1983"}]'::jsonb,
  1, 'cinema'
),
-- Q50 sports medium
(
  '{"es":"¿Cuántos sets se necesitan para ganar un partido de tenis en Grand Slam masculino?","en":"How many sets are needed to win a men s Grand Slam tennis match?","eu":"Zenbat set behar dira Grand Slam maskulinoko tenis partida bat irabazteko?","ca":"Quants sets es necessiten per guanyar un partit de tennis de Grand Slam masculi?","fr":"Combien de sets faut-il pour gagner un match de tennis du Grand Chelem masculin?","gl":"Cantos sets se necesitan para ganar un partido de tenis de Grand Slam masculino?","it":"Quanti set servono per vincere una partita di tennis del Grande Slam maschile?","de":"Wie viele Saetze braucht man um ein Herren-Grand-Slam-Tennismatch zu gewinnen?","pt":"Quantos sets sao necessarios para ganhar um jogo de tenis masculino de Grand Slam?"}'::jsonb,
  '[{"es":"2","en":"2","eu":"2","ca":"2","fr":"2","gl":"2","it":"2","de":"2","pt":"2"},{"es":"3","en":"3","eu":"3","ca":"3","fr":"3","gl":"3","it":"3","de":"3","pt":"3"},{"es":"4","en":"4","eu":"4","ca":"4","fr":"4","gl":"4","it":"4","de":"4","pt":"4"},{"es":"5","en":"5","eu":"5","ca":"5","fr":"5","gl":"5","it":"5","de":"5","pt":"5"}]'::jsonb,
  1, 'sports'
),
-- Q51 science medium
(
  '{"es":"¿Cuál es el elemento químico más abundante en el universo?","en":"What is the most abundant chemical element in the universe?","eu":"Zein da unibertsoko elementu kimiko ugariena?","ca":"Quin es l element quimic mes abundant a l univers?","fr":"Quel est l element chimique le plus abondant dans l univers?","gl":"Cal e o elemento químico mais abundante no universo?","it":"Qual e l elemento chimico piu abbondante nell universo?","de":"Welches ist das haeufigste chemische Element im Universum?","pt":"Qual e o elemento químico mais abundante no universo?"}'::jsonb,
  '[{"es":"Helio","en":"Helium","eu":"Helioa","ca":"Heli","fr":"Helium","gl":"Helio","it":"Elio","de":"Helium","pt":"Helio"},{"es":"Hidrógeno","en":"Hydrogen","eu":"Hidrogenoa","ca":"Hidrogen","fr":"Hydrogene","gl":"Hidroxeno","it":"Idrogeno","de":"Wasserstoff","pt":"Hidrogenio"},{"es":"Oxígeno","en":"Oxygen","eu":"Oxigenoa","ca":"Oxigen","fr":"Oxygene","gl":"Osixeno","it":"Ossigeno","de":"Sauerstoff","pt":"Oxigenio"},{"es":"Carbono","en":"Carbon","eu":"Karbonoa","ca":"Carboni","fr":"Carbone","gl":"Carbono","it":"Carbonio","de":"Kohlenstoff","pt":"Carbono"}]'::jsonb,
  1, 'science'
),
-- Q52 art medium
(
  '{"es":"¿En qué museo se encuentra la Mona Lisa?","en":"In which museum is the Mona Lisa displayed?","eu":"Zein museoan dago Mona Lisa?","ca":"A quin museu es troba la Mona Lisa?","fr":"Dans quel musee se trouve la Joconde?","gl":"En que museo se atopa a Mona Lisa?","it":"In quale museo si trova la Gioconda?","de":"In welchem Museum befindet sich die Mona Lisa?","pt":"Em que museu se encontra a Mona Lisa?"}'::jsonb,
  '[{"es":"Museo del Prado","en":"Prado Museum","eu":"Prado Museoa","ca":"Museu del Prado","fr":"Musee du Prado","gl":"Museo do Prado","it":"Museo del Prado","de":"Prado-Museum","pt":"Museu do Prado"},{"es":"Museo del Louvre","en":"Louvre Museum","eu":"Louvre Museoa","ca":"Museu del Louvre","fr":"Musee du Louvre","gl":"Museo do Louvre","it":"Museo del Louvre","de":"Louvre","pt":"Museu do Louvre"},{"es":"Galeria Uffizi","en":"Uffizi Gallery","eu":"Uffizi Galeria","ca":"Galeria dels Uffizi","fr":"Galerie des Offices","gl":"Galeria Uffizi","it":"Galleria degli Uffizi","de":"Uffizien","pt":"Galeria Uffizi"},{"es":"Museo Britanico","en":"British Museum","eu":"Britainiar Museoa","ca":"Museu Britanic","fr":"British Museum","gl":"Museo Britanico","it":"British Museum","de":"Britisches Museum","pt":"Museu Britanico"}]'::jsonb,
  1, 'art'
),
-- Q53 landmarks medium
(
  '{"es":"¿En qué país se encuentra el Taj Mahal?","en":"In which country is the Taj Mahal located?","eu":"Zein herrialdetan dago Taj Mahal?","ca":"A quin pais es troba el Taj Mahal?","fr":"Dans quel pays se trouve le Taj Mahal?","gl":"En que pais se atopa o Taj Mahal?","it":"In quale paese si trova il Taj Mahal?","de":"In welchem Land befindet sich das Taj Mahal?","pt":"Em que pais se encontra o Taj Mahal?"}'::jsonb,
  '[{"es":"Pakistan","en":"Pakistan","eu":"Pakistan","ca":"Pakistan","fr":"Pakistan","gl":"Paquistan","it":"Pakistan","de":"Pakistan","pt":"Paquistao"},{"es":"India","en":"India","eu":"India","ca":"India","fr":"Inde","gl":"India","it":"India","de":"Indien","pt":"India"},{"es":"Bangladesh","en":"Bangladesh","eu":"Bangladesh","ca":"Bangla Desh","fr":"Bangladesh","gl":"Bangladesh","it":"Bangladesh","de":"Bangladesch","pt":"Bangladesh"},{"es":"Nepal","en":"Nepal","eu":"Nepal","ca":"Nepal","fr":"Nepal","gl":"Nepal","it":"Nepal","de":"Nepal","pt":"Nepal"}]'::jsonb,
  1, 'landmarks'
),
-- Q54 literature medium
(
  '{"es":"¿Quién escribió 1984?","en":"Who wrote 1984?","eu":"Nork idatzi zuen 1984?","ca":"Qui va escriure 1984?","fr":"Qui a ecrit 1984?","gl":"Quen escribiu 1984?","it":"Chi ha scritto 1984?","de":"Wer schrieb 1984?","pt":"Quem escreveu 1984?"}'::jsonb,
  '[{"es":"Aldous Huxley","en":"Aldous Huxley","eu":"Aldous Huxley","ca":"Aldous Huxley","fr":"Aldous Huxley","gl":"Aldous Huxley","it":"Aldous Huxley","de":"Aldous Huxley","pt":"Aldous Huxley"},{"es":"George Orwell","en":"George Orwell","eu":"George Orwell","ca":"George Orwell","fr":"George Orwell","gl":"George Orwell","it":"George Orwell","de":"George Orwell","pt":"George Orwell"},{"es":"Ray Bradbury","en":"Ray Bradbury","eu":"Ray Bradbury","ca":"Ray Bradbury","fr":"Ray Bradbury","gl":"Ray Bradbury","it":"Ray Bradbury","de":"Ray Bradbury","pt":"Ray Bradbury"},{"es":"H.G. Wells","en":"H.G. Wells","eu":"H.G. Wells","ca":"H.G. Wells","fr":"H.G. Wells","gl":"H.G. Wells","it":"H.G. Wells","de":"H.G. Wells","pt":"H.G. Wells"}]'::jsonb,
  1, 'literature'
),
-- Q55 music medium
(
  '{"es":"¿De qué país era Mozart?","en":"Which country was Mozart from?","eu":"Zein herrialdetakoa zen Mozart?","ca":"De quin pais era Mozart?","fr":"De quel pays etait Mozart?","gl":"De que pais era Mozart?","it":"Di quale paese era Mozart?","de":"Aus welchem Land stammte Mozart?","pt":"De que pais era Mozart?"}'::jsonb,
  '[{"es":"Alemania","en":"Germany","eu":"Alemania","ca":"Alemanya","fr":"Allemagne","gl":"Alemaña","it":"Germania","de":"Deutschland","pt":"Alemanha"},{"es":"Austria","en":"Austria","eu":"Austria","ca":"Austria","fr":"Autriche","gl":"Austria","it":"Austria","de":"Oesterreich","pt":"Austria"},{"es":"Italia","en":"Italy","eu":"Italia","ca":"Italia","fr":"Italie","gl":"Italia","it":"Italia","de":"Italien","pt":"Italia"},{"es":"Suiza","en":"Switzerland","eu":"Suitza","ca":"Suissa","fr":"Suisse","gl":"Suiza","it":"Svizzera","de":"Schweiz","pt":"Suica"}]'::jsonb,
  1, 'music'
),
-- Q56 animals medium
(
  '{"es":"¿Cuál es el único mamífero capaz de volar?","en":"What is the only mammal capable of flight?","eu":"Zein da hegan egin dezakeen ugaztun bakarra?","ca":"Quin es l unic mamifer capac de volar?","fr":"Quel est le seul mammifere capable de voler?","gl":"Cal e o único mamífero capaz de voar?","it":"Qual e l único mammifero capace di volare?","de":"Welches ist das einzige flugfaehige Saeugetier?","pt":"Qual e o único mamífero capaz de voar?"}'::jsonb,
  '[{"es":"Ardilla voladora","en":"Flying squirrel","eu":"Katagorri hegalaria","ca":"Esquirol volador","fr":"Ecureuil volant","gl":"Esquio voador","it":"Scoiattolo volante","de":"Flughoernchen","pt":"Esquilo voador"},{"es":"Murcielago","en":"Bat","eu":"Saguzarra","ca":"Ratpenat","fr":"Chauve-souris","gl":"Morcego","it":"Pipistrello","de":"Fledermaus","pt":"Morcego"},{"es":"Colibri","en":"Hummingbird","eu":"Kolibria","ca":"Colibri","fr":"Colibri","gl":"Colibri","it":"Colibri","de":"Kolibri","pt":"Colibri"},{"es":"Águila","en":"Eagle","eu":"Arranoa","ca":"Aguila","fr":"Aigle","gl":"Aguia","it":"Aquila","de":"Adler","pt":"Aguia"}]'::jsonb,
  1, 'animals'
),
-- Q57 geography medium
(
  '{"es":"¿Cuál es la capital de Australia?","en":"What is the capital of Australia?","eu":"Zein da Australiako hiriburua?","ca":"Quina es la capital d Australia?","fr":"Quelle est la capitale de l Australie?","gl":"Cal e a capital de Australia?","it":"Qual e la capitale dell Australia?","de":"Was ist die Hauptstadt von Australien?","pt":"Qual e a capital da Australia?"}'::jsonb,
  '[{"es":"Sidney","en":"Sydney","eu":"Sydney","ca":"Sydney","fr":"Sydney","gl":"Sidney","it":"Sydney","de":"Sydney","pt":"Sydney"},{"es":"Melbourne","en":"Melbourne","eu":"Melbourne","ca":"Melbourne","fr":"Melbourne","gl":"Melbourne","it":"Melbourne","de":"Melbourne","pt":"Melbourne"},{"es":"Canberra","en":"Canberra","eu":"Canberra","ca":"Canberra","fr":"Canberra","gl":"Canberra","it":"Canberra","de":"Canberra","pt":"Canberra"},{"es":"Brisbane","en":"Brisbane","eu":"Brisbane","ca":"Brisbane","fr":"Brisbane","gl":"Brisbane","it":"Brisbane","de":"Brisbane","pt":"Brisbane"}]'::jsonb,
  2, 'geography'
),
-- Q58 science medium
(
  '{"es":"¿Cuántos cromosomas tiene el ser humano?","en":"How many chromosomes does a human have?","eu":"Zenbat kromosoma ditu gizakiak?","ca":"Quants cromosomes te l esser huma?","fr":"Combien de chromosomes possede l etre humain?","gl":"Cantos cromosomas ten o ser humano?","it":"Quanti cromosomi ha l essere umano?","de":"Wie viele Chromosomen hat der Mensch?","pt":"Quantos cromossomas tem o ser humano?"}'::jsonb,
  '[{"es":"23","en":"23","eu":"23","ca":"23","fr":"23","gl":"23","it":"23","de":"23","pt":"23"},{"es":"44","en":"44","eu":"44","ca":"44","fr":"44","gl":"44","it":"44","de":"44","pt":"44"},{"es":"46","en":"46","eu":"46","ca":"46","fr":"46","gl":"46","it":"46","de":"46","pt":"46"},{"es":"48","en":"48","eu":"48","ca":"48","fr":"48","gl":"48","it":"48","de":"48","pt":"48"}]'::jsonb,
  2, 'science'
),
-- Q59 history medium
(
  '{"es":"¿Cuánto duró la Segunda Guerra Mundial?","en":"How long did World War II last?","eu":"Zenbat iraun zuen Bigarren Mundu Gerrak?","ca":"Quant va durar la Segona Guerra Mundial?","fr":"Combien de temps a dure la Seconde Guerre mondiale?","gl":"Canto durou a Segunda Guerra Mundial?","it":"Quanto e durata la Seconda Guerra Mondiale?","de":"Wie lange dauerte der Zweite Weltkrieg?","pt":"Quanto tempo durou a Segunda Guerra Mundial?"}'::jsonb,
  '[{"es":"4 años","en":"4 years","eu":"4 urte","ca":"4 anys","fr":"4 ans","gl":"4 anos","it":"4 anni","de":"4 Jahre","pt":"4 anos"},{"es":"6 años","en":"6 years","eu":"6 urte","ca":"6 anys","fr":"6 ans","gl":"6 anos","it":"6 anni","de":"6 Jahre","pt":"6 anos"},{"es":"8 años","en":"8 years","eu":"8 urte","ca":"8 anys","fr":"8 ans","gl":"8 anos","it":"8 anni","de":"8 Jahre","pt":"8 anos"},{"es":"10 años","en":"10 years","eu":"10 urte","ca":"10 anys","fr":"10 ans","gl":"10 anos","it":"10 anni","de":"10 Jahre","pt":"10 anos"}]'::jsonb,
  1, 'history'
),
-- Q60 space medium
(
  '{"es":"¿Cuál es el planeta más caliente del sistema solar?","en":"What is the hottest planet in the solar system?","eu":"Zein da eguzki-sistemako planetarik beroena?","ca":"Quin es el planeta mes calent del sistema solar?","fr":"Quelle est la planete la plus chaude du systeme solaire?","gl":"Cal e o planeta mais quente do sistema solar?","it":"Qual e il pianeta piu caldo del sistema solare?","de":"Welcher ist der heisseste Planet im Sonnensystem?","pt":"Qual e o planeta mais quente do sistema solar?"}'::jsonb,
  '[{"es":"Mercurio","en":"Mercury","eu":"Merkurio","ca":"Mercuri","fr":"Mercure","gl":"Mercurio","it":"Mercurio","de":"Merkur","pt":"Mercurio"},{"es":"Venus","en":"Venus","eu":"Artizarra","ca":"Venus","fr":"Venus","gl":"Venus","it":"Venere","de":"Venus","pt":"Venus"},{"es":"Marte","en":"Mars","eu":"Marte","ca":"Mart","fr":"Mars","gl":"Marte","it":"Marte","de":"Mars","pt":"Marte"},{"es":"Júpiter","en":"Jupiter","eu":"Jupiter","ca":"Jupiter","fr":"Jupiter","gl":"Xupiter","it":"Giove","de":"Jupiter","pt":"Jupiter"}]'::jsonb,
  1, 'space'
),
-- Q61 technology medium
(
  '{"es":"¿Qué significa la sigla HTML?","en":"What does the acronym HTML stand for?","eu":"Zer esan nahi du HTML siglak?","ca":"Que significa la sigla HTML?","fr":"Que signifie le sigle HTML?","gl":"Que significa a sigla HTML?","it":"Cosa significa l acronimo HTML?","de":"Wofuer steht die Abkuerzung HTML?","pt":"O que significa a sigla HTML?"}'::jsonb,
  '[{"es":"HyperText Markup Language","en":"HyperText Markup Language","eu":"HyperText Markup Language","ca":"HyperText Markup Language","fr":"HyperText Markup Language","gl":"HyperText Markup Language","it":"HyperText Markup Language","de":"HyperText Markup Language","pt":"HyperText Markup Language"},{"es":"High Tech Modern Language","en":"High Tech Modern Language","eu":"High Tech Modern Language","ca":"High Tech Modern Language","fr":"High Tech Modern Language","gl":"High Tech Modern Language","it":"High Tech Modern Language","de":"High Tech Modern Language","pt":"High Tech Modern Language"},{"es":"Home Tool Markup Language","en":"Home Tool Markup Language","eu":"Home Tool Markup Language","ca":"Home Tool Markup Language","fr":"Home Tool Markup Language","gl":"Home Tool Markup Language","it":"Home Tool Markup Language","de":"Home Tool Markup Language","pt":"Home Tool Markup Language"},{"es":"Hyper Transfer Mode Link","en":"Hyper Transfer Mode Link","eu":"Hyper Transfer Mode Link","ca":"Hyper Transfer Mode Link","fr":"Hyper Transfer Mode Link","gl":"Hyper Transfer Mode Link","it":"Hyper Transfer Mode Link","de":"Hyper Transfer Mode Link","pt":"Hyper Transfer Mode Link"}]'::jsonb,
  0, 'technology'
),
-- Q62 nature medium
(
  '{"es":"¿Cuál es la cascada más alta del mundo?","en":"What is the tallest waterfall in the world?","eu":"Zein da munduko ur-jauzirik altuena?","ca":"Quina es la cascada mes alta del mon?","fr":"Quelle est la cascade la plus haute du monde?","gl":"Cal e a fervenza mais alta do mundo?","it":"Qual e la cascata piu alta del mondo?","de":"Welcher ist der hoechste Wasserfall der Welt?","pt":"Qual e a cascata mais alta do mundo?"}'::jsonb,
  '[{"es":"Cataratas del Niagara","en":"Niagara Falls","eu":"Niagarako ur-jauziak","ca":"Cascades del Niagara","fr":"Chutes du Niagara","gl":"Cataratas do Niagara","it":"Cascate del Niagara","de":"Niagarafaelle","pt":"Cataratas do Niagara"},{"es":"Salto Angel","en":"Angel Falls","eu":"Aingeru Jauzia","ca":"Salt Angel","fr":"Salto Angel","gl":"Salto Anxo","it":"Salto Angel","de":"Salto Angel","pt":"Salto Angel"},{"es":"Cataratas Victoria","en":"Victoria Falls","eu":"Viktoria Ur-jauziak","ca":"Cascades Victoria","fr":"Chutes Victoria","gl":"Cataratas Victoria","it":"Cascate Vittoria","de":"Victoriafaelle","pt":"Cataratas Victoria"},{"es":"Cataratas de Iguazu","en":"Iguazu Falls","eu":"Iguazuko ur-jauziak","ca":"Cascades d Iguazu","fr":"Chutes d Iguazu","gl":"Cataratas de Iguazu","it":"Cascate di Iguazu","de":"Iguazu-Wasserfaelle","pt":"Cataratas do Iguacu"}]'::jsonb,
  1, 'nature'
),
-- Q63 food medium
(
  '{"es":"¿Qué especia le da color amarillo al curry?","en":"Which spice gives curry its yellow color?","eu":"Zein espeziak ematen dio curry-ari kolore horia?","ca":"Quina especia dona color groc al curri?","fr":"Quelle epice donne au curry sa couleur jaune?","gl":"Que especia lle da cor amarela ao curry?","it":"Quale spezia conferisce il colore giallo al curry?","de":"Welches Gewuerz gibt dem Curry seine gelbe Farbe?","pt":"Que especiaria da a cor amarela ao caril?"}'::jsonb,
  '[{"es":"Azafrán","en":"Saffron","eu":"Azafrana","ca":"Safra","fr":"Safran","gl":"Azafran","it":"Zafferano","de":"Safran","pt":"Acafrao"},{"es":"Curcuma","en":"Turmeric","eu":"Kurkuma","ca":"Curcuma","fr":"Curcuma","gl":"Curcuma","it":"Curcuma","de":"Kurkuma","pt":"Curcuma"},{"es":"Canela","en":"Cinnamon","eu":"Kanela","ca":"Canyella","fr":"Cannelle","gl":"Canela","it":"Cannella","de":"Zimt","pt":"Canela"},{"es":"Jengibre","en":"Ginger","eu":"Jengibrea","ca":"Gingebre","fr":"Gingembre","gl":"Xenxibre","it":"Zenzero","de":"Ingwer","pt":"Gengibre"}]'::jsonb,
  1, 'food'
),
-- Q64 body medium
(
  '{"es":"¿Cuál es el músculo más grande del cuerpo humano?","en":"What is the largest muscle in the human body?","eu":"Zein da giza gorputzeko giharrik handiena?","ca":"Quin es el muscle mes gran del cos huma?","fr":"Quel est le plus grand muscle du corps humain?","gl":"Cal e o músculo mais grande do corpo humano?","it":"Qual e il muscolo piu grande del corpo umano?","de":"Welcher ist der groesste Muskel im menschlichen Koerper?","pt":"Qual e o maior músculo do corpo humano?"}'::jsonb,
  '[{"es":"Biceps","en":"Biceps","eu":"Bizepsa","ca":"Biceps","fr":"Biceps","gl":"Biceps","it":"Bicipite","de":"Bizeps","pt":"Biceps"},{"es":"Gluteo mayor","en":"Gluteus maximus","eu":"Gluteo nagusia","ca":"Gluti major","fr":"Grand fessier","gl":"Gluteo maior","it":"Grande gluteo","de":"Grosser Gesaessmuskel","pt":"Gluteo maximo"},{"es":"Cuadriceps","en":"Quadriceps","eu":"Koadrizepsa","ca":"Quadriceps","fr":"Quadriceps","gl":"Cuadriceps","it":"Quadricipite","de":"Quadrizeps","pt":"Quadriceps"},{"es":"Pectoral","en":"Pectoral","eu":"Pektorala","ca":"Pectoral","fr":"Pectoral","gl":"Pectoral","it":"Pettorale","de":"Brustmuskel","pt":"Peitoral"}]'::jsonb,
  1, 'body'
),
-- Q65 cinema medium
(
  '{"es":"¿Qué actor interpretó a Jack en Titanic?","en":"Which actor played Jack in Titanic?","eu":"Zein aktorek antzeztu zuen Jack Titanic filmean?","ca":"Quin actor va interpretar en Jack a Titanic?","fr":"Quel acteur a joue Jack dans Titanic?","gl":"Que actor interpretou a Jack en Titanic?","it":"Quale attore ha interpretato Jack in Titanic?","de":"Welcher Schauspieler spielte Jack in Titanic?","pt":"Que ator interpretou Jack em Titanic?"}'::jsonb,
  '[{"es":"Brad Pitt","en":"Brad Pitt","eu":"Brad Pitt","ca":"Brad Pitt","fr":"Brad Pitt","gl":"Brad Pitt","it":"Brad Pitt","de":"Brad Pitt","pt":"Brad Pitt"},{"es":"Tom Cruise","en":"Tom Cruise","eu":"Tom Cruise","ca":"Tom Cruise","fr":"Tom Cruise","gl":"Tom Cruise","it":"Tom Cruise","de":"Tom Cruise","pt":"Tom Cruise"},{"es":"Leonardo DiCaprio","en":"Leonardo DiCaprio","eu":"Leonardo DiCaprio","ca":"Leonardo DiCaprio","fr":"Leonardo DiCaprio","gl":"Leonardo DiCaprio","it":"Leonardo DiCaprio","de":"Leonardo DiCaprio","pt":"Leonardo DiCaprio"},{"es":"Johnny Depp","en":"Johnny Depp","eu":"Johnny Depp","ca":"Johnny Depp","fr":"Johnny Depp","gl":"Johnny Depp","it":"Johnny Depp","de":"Johnny Depp","pt":"Johnny Depp"}]'::jsonb,
  2, 'cinema'
),
-- Q66 sports medium
(
  '{"es":"¿En qué país se celebraron los primeros Juegos Olímpicos modernos?","en":"In which country were the first modern Olympic Games held?","eu":"Zein herrialdetan ospatu ziren lehen Joko Olinpiko modernoak?","ca":"A quin pais es van celebrar els primers Jocs Olimpics moderns?","fr":"Dans quel pays les premiers Jeux Olympiques modernes ont-ils eu lieu?","gl":"En que pais se celebraron os primeiros Xogos Olímpicos modernos?","it":"In quale paese si sono tenuti i primi Giochi Olimpici moderni?","de":"In welchem Land fanden die ersten modernen Olympischen Spiele statt?","pt":"Em que pais se realizaram os primeiros Jogos Olímpicos modernos?"}'::jsonb,
  '[{"es":"Francia","en":"France","eu":"Frantzia","ca":"Franca","fr":"France","gl":"Francia","it":"Francia","de":"Frankreich","pt":"Franca"},{"es":"Grecia","en":"Greece","eu":"Grezia","ca":"Grecia","fr":"Grece","gl":"Grecia","it":"Grecia","de":"Griechenland","pt":"Grecia"},{"es":"Italia","en":"Italy","eu":"Italia","ca":"Italia","fr":"Italie","gl":"Italia","it":"Italia","de":"Italien","pt":"Italia"},{"es":"Reino Unido","en":"United Kingdom","eu":"Erresuma Batua","ca":"Regne Unit","fr":"Royaume-Uni","gl":"Reino Unido","it":"Regno Unito","de":"Vereinigtes Koenigreich","pt":"Reino Unido"}]'::jsonb,
  1, 'sports'
),
-- Q67 geography medium
(
  '{"es":"¿Cuál es el río más largo de Europa?","en":"What is the longest river in Europe?","eu":"Zein da Europako ibairik luzeena?","ca":"Quin es el riu mes llarg d Europa?","fr":"Quel est le plus long fleuve d Europe?","gl":"Cal e o rio mais longo de Europa?","it":"Qual e il fiume piu lungo d Europa?","de":"Welcher ist der laengste Fluss Europas?","pt":"Qual e o rio mais longo da Europa?"}'::jsonb,
  '[{"es":"Danubio","en":"Danube","eu":"Danubioa","ca":"Danubi","fr":"Danube","gl":"Danubio","it":"Danubio","de":"Donau","pt":"Danubio"},{"es":"Rin","en":"Rhine","eu":"Rin","ca":"Rin","fr":"Rhin","gl":"Rin","it":"Reno","de":"Rhein","pt":"Reno"},{"es":"Volga","en":"Volga","eu":"Volga","ca":"Volga","fr":"Volga","gl":"Volga","it":"Volga","de":"Wolga","pt":"Volga"},{"es":"Sena","en":"Seine","eu":"Sena","ca":"Sena","fr":"Seine","gl":"Sena","it":"Senna","de":"Seine","pt":"Sena"}]'::jsonb,
  2, 'geography'
),
-- Q68 science medium
(
  '{"es":"¿Qué órgano del cuerpo produce insulina?","en":"Which organ in the body produces insulin?","eu":"Gorputzeko zein órganok ekoizten du intsulina?","ca":"Quin organ del cos produeix insulina?","fr":"Quel organe du corps produit l insuline?","gl":"Que órgano do corpo produce insulina?","it":"Quale órgano del corpo produce insulina?","de":"Welches Organ im Koerper produziert Insulin?","pt":"Qual orgao do corpo produz insulina?"}'::jsonb,
  '[{"es":"Hígado","en":"Liver","eu":"Gibela","ca":"Fetge","fr":"Foie","gl":"Figado","it":"Fegato","de":"Leber","pt":"Figado"},{"es":"Riñón","en":"Kidney","eu":"Giltzurruna","ca":"Ronyo","fr":"Rein","gl":"Rinon","it":"Rene","de":"Niere","pt":"Rim"},{"es":"Pancreas","en":"Pancreas","eu":"Pankreasa","ca":"Pancrees","fr":"Pancreas","gl":"Pancreas","it":"Pancreas","de":"Bauchspeicheldruese","pt":"Pancreas"},{"es":"Estómago","en":"Stomach","eu":"Urdaila","ca":"Estomac","fr":"Estomac","gl":"Estomago","it":"Stomaco","de":"Magen","pt":"Estomago"}]'::jsonb,
  2, 'science'
),
-- Q69 animals medium
(
  '{"es":"¿Cuánto tiempo dura el embarazo de un elefante aproximadamente?","en":"How long is an elephant s pregnancy approximately?","eu":"Zenbat irauten du elefante baten haurdunaldiak gutxi gorabehera?","ca":"Quant dura l embaras d un elefant aproximadament?","fr":"Combien de temps dure la grossesse d un elephant environ?","gl":"Canto dura o embarazo dun elefante aproximadamente?","it":"Quanto dura la gravidanza di un elefante approssimativamente?","de":"Wie lange dauert die Schwangerschaft eines Elefanten ungefaehr?","pt":"Quanto tempo dura a gravidez de um elefante aproximadamente?"}'::jsonb,
  '[{"es":"6 meses","en":"6 months","eu":"6 hilabete","ca":"6 mesos","fr":"6 mois","gl":"6 meses","it":"6 mesi","de":"6 Monate","pt":"6 meses"},{"es":"12 meses","en":"12 months","eu":"12 hilabete","ca":"12 mesos","fr":"12 mois","gl":"12 meses","it":"12 mesi","de":"12 Monate","pt":"12 meses"},{"es":"22 meses","en":"22 months","eu":"22 hilabete","ca":"22 mesos","fr":"22 mois","gl":"22 meses","it":"22 mesi","de":"22 Monate","pt":"22 meses"},{"es":"30 meses","en":"30 months","eu":"30 hilabete","ca":"30 mesos","fr":"30 mois","gl":"30 meses","it":"30 mesi","de":"30 Monate","pt":"30 meses"}]'::jsonb,
  2, 'animals'
),
-- Q70 landmarks medium
(
  '{"es":"¿En qué país se encuentra Machu Picchu?","en":"In which country is Machu Picchu located?","eu":"Zein herrialdetan dago Machu Picchu?","ca":"A quin pais es troba Machu Picchu?","fr":"Dans quel pays se trouve le Machu Picchu?","gl":"En que pais se atopa Machu Picchu?","it":"In quale paese si trova Machu Picchu?","de":"In welchem Land befindet sich Machu Picchu?","pt":"Em que pais se encontra Machu Picchu?"}'::jsonb,
  '[{"es":"Bolivia","en":"Bolivia","eu":"Bolivia","ca":"Bolivia","fr":"Bolivie","gl":"Bolivia","it":"Bolivia","de":"Bolivien","pt":"Bolivia"},{"es":"Ecuador","en":"Ecuador","eu":"Ekuador","ca":"Equador","fr":"Equateur","gl":"Ecuador","it":"Ecuador","de":"Ecuador","pt":"Equador"},{"es":"Perú","en":"Peru","eu":"Peru","ca":"Peru","fr":"Perou","gl":"Peru","it":"Peru","de":"Peru","pt":"Peru"},{"es":"Colombia","en":"Colombia","eu":"Kolonbia","ca":"Colombia","fr":"Colombie","gl":"Colombia","it":"Colombia","de":"Kolumbien","pt":"Colombia"}]'::jsonb,
  2, 'landmarks'
),
-- Q71 literature medium
(
  '{"es":"¿Quién escribió Cien años de soledad?","en":"Who wrote One Hundred Years of Solitude?","eu":"Nork idatzi zuen Ehun urteko bakardadea?","ca":"Qui va escriure Cent anys de solitud?","fr":"Qui a ecrit Cent ans de solitude?","gl":"Quen escribiu Cen anos de soidade?","it":"Chi ha scritto Cent anni di solitudine?","de":"Wer schrieb Hundert Jahre Einsamkeit?","pt":"Quem escreveu Cem Anos de Solidao?"}'::jsonb,
  '[{"es":"Mario Vargas Llosa","en":"Mario Vargas Llosa","eu":"Mario Vargas Llosa","ca":"Mario Vargas Llosa","fr":"Mario Vargas Llosa","gl":"Mario Vargas Llosa","it":"Mario Vargas Llosa","de":"Mario Vargas Llosa","pt":"Mario Vargas Llosa"},{"es":"Gabriel Garcia Marquez","en":"Gabriel Garcia Marquez","eu":"Gabriel Garcia Marquez","ca":"Gabriel Garcia Marquez","fr":"Gabriel Garcia Marquez","gl":"Gabriel Garcia Marquez","it":"Gabriel Garcia Marquez","de":"Gabriel Garcia Marquez","pt":"Gabriel Garcia Marquez"},{"es":"Pablo Neruda","en":"Pablo Neruda","eu":"Pablo Neruda","ca":"Pablo Neruda","fr":"Pablo Neruda","gl":"Pablo Neruda","it":"Pablo Neruda","de":"Pablo Neruda","pt":"Pablo Neruda"},{"es":"Jorge Luis Borges","en":"Jorge Luis Borges","eu":"Jorge Luis Borges","ca":"Jorge Luis Borges","fr":"Jorge Luis Borges","gl":"Jorge Luis Borges","it":"Jorge Luis Borges","de":"Jorge Luis Borges","pt":"Jorge Luis Borges"}]'::jsonb,
  1, 'literature'
),
-- Q72 music medium
(
  '{"es":"¿Cuántas teclas tiene un piano estandar?","en":"How many keys does a standard piano have?","eu":"Zenbat tekla ditu piano estandar batek?","ca":"Quantes tecles te un piano estandard?","fr":"Combien de touches a un piano standard?","gl":"Cantas teclas ten un piano estandar?","it":"Quanti tasti ha un pianoforte standard?","de":"Wie viele Tasten hat ein Standardklavier?","pt":"Quantas teclas tem um piano padrao?"}'::jsonb,
  '[{"es":"76","en":"76","eu":"76","ca":"76","fr":"76","gl":"76","it":"76","de":"76","pt":"76"},{"es":"88","en":"88","eu":"88","ca":"88","fr":"88","gl":"88","it":"88","de":"88","pt":"88"},{"es":"96","en":"96","eu":"96","ca":"96","fr":"96","gl":"96","it":"96","de":"96","pt":"96"},{"es":"104","en":"104","eu":"104","ca":"104","fr":"104","gl":"104","it":"104","de":"104","pt":"104"}]'::jsonb,
  1, 'music'
),
-- Q73 space hard
(
  '{"es":"¿Cuál es la galaxia más cercana a la Via Lactea?","en":"What is the nearest galaxy to the Milky Way?","eu":"Zein da Esne Bidetik hurbilen dagoen galaxia?","ca":"Quina es la galaxia mes propera a la Via Lactia?","fr":"Quelle est la galaxie la plus proche de la Voie lactee?","gl":"Cal e a galaxia mais cercana a Via Lactea?","it":"Qual e la galassia piu vicina alla Via Lattea?","de":"Welche Galaxie ist der Milchstrasse am naechsten?","pt":"Qual e a galaxia mais proxima da Via Lactea?"}'::jsonb,
  '[{"es":"Andromeda","en":"Andromeda","eu":"Andromeda","ca":"Andromeda","fr":"Andromede","gl":"Andromeda","it":"Andromeda","de":"Andromeda","pt":"Andromeda"},{"es":"Triangulo","en":"Triangulum","eu":"Trianguloa","ca":"Triangle","fr":"Triangle","gl":"Triangulo","it":"Triangolo","de":"Dreiecksgalaxie","pt":"Triangulo"},{"es":"Enana de Sagitario","en":"Sagittarius Dwarf","eu":"Sagitario Nanoa","ca":"Nana de Sagitari","fr":"Naine du Sagittaire","gl":"Anana de Saxitario","it":"Nana del Sagittario","de":"Sagittarius-Zwerggalaxie","pt":"Ana de Sagitario"},{"es":"Gran Nube de Magallanes","en":"Large Magellanic Cloud","eu":"Magallanes-en Hodei Handia","ca":"Gran Nuvol de Magallanes","fr":"Grand Nuage de Magellan","gl":"Gran Nube de Magallans","it":"Grande Nube di Magellano","de":"Grosse Magellansche Wolke","pt":"Grande Nuvem de Magalhaes"}]'::jsonb,
  2, 'space'
),
-- Q74 science hard
(
  '{"es":"¿Cuál es el punto de ebullición del agua en grados Celsius al nivel del mar?","en":"What is the boiling point of water in degrees Celsius at sea level?","eu":"Zein da uraren irakite-puntua Celsius gradutan itsas mailan?","ca":"Quin es el punt d ebullicio de l aigua en graus Celsius a nivell del mar?","fr":"Quel est le point d ebullition de l eau en degres Celsius au niveau de la mer?","gl":"Cal e o punto de ebulicion da auga en graos Celsius ao nivel do mar?","it":"Qual e il punto di ebollizione dell acqua in gradi Celsius al livello del mare?","de":"Was ist der Siedepunkt von Wasser in Grad Celsius auf Meereshoehe?","pt":"Qual e o ponto de ebulicao da agua em graus Celsius ao nivel do mar?"}'::jsonb,
  '[{"es":"90","en":"90","eu":"90","ca":"90","fr":"90","gl":"90","it":"90","de":"90","pt":"90"},{"es":"100","en":"100","eu":"100","ca":"100","fr":"100","gl":"100","it":"100","de":"100","pt":"100"},{"es":"110","en":"110","eu":"110","ca":"110","fr":"110","gl":"110","it":"110","de":"110","pt":"110"},{"es":"120","en":"120","eu":"120","ca":"120","fr":"120","gl":"120","it":"120","de":"120","pt":"120"}]'::jsonb,
  1, 'science'
),
-- Q75 history hard
(
  '{"es":"¿En qué año comenzó la Revolución Francesa?","en":"In what year did the French Revolution begin?","eu":"Zein urtetan hasi zen Frantziako Iraultza?","ca":"En quin any va comencar la Revolucio Francesa?","fr":"En quelle annee a commence la Revolution francaise?","gl":"En que ano comezou a Revolución Francesa?","it":"In che anno e iniziata la Rivoluzione Francese?","de":"In welchem Jahr begann die Franzoesische Revolution?","pt":"Em que ano comecou a Revolucao Francesa?"}'::jsonb,
  '[{"es":"1776","en":"1776","eu":"1776","ca":"1776","fr":"1776","gl":"1776","it":"1776","de":"1776","pt":"1776"},{"es":"1789","en":"1789","eu":"1789","ca":"1789","fr":"1789","gl":"1789","it":"1789","de":"1789","pt":"1789"},{"es":"1799","en":"1799","eu":"1799","ca":"1799","fr":"1799","gl":"1799","it":"1799","de":"1799","pt":"1799"},{"es":"1804","en":"1804","eu":"1804","ca":"1804","fr":"1804","gl":"1804","it":"1804","de":"1804","pt":"1804"}]'::jsonb,
  1, 'history'
),
-- Q76 geography hard
(
  '{"es":"¿Cuál es la isla más grande del mundo?","en":"What is the largest island in the world?","eu":"Zein da munduko irlarik handiena?","ca":"Quina es l illa mes gran del mon?","fr":"Quelle est la plus grande ile du monde?","gl":"Cal e a illa mais grande do mundo?","it":"Qual e l isola piu grande del mondo?","de":"Welche ist die groesste Insel der Welt?","pt":"Qual e a maior ilha do mundo?"}'::jsonb,
  '[{"es":"Borneo","en":"Borneo","eu":"Borneo","ca":"Borneo","fr":"Borneo","gl":"Borneo","it":"Borneo","de":"Borneo","pt":"Borneu"},{"es":"Madagascar","en":"Madagascar","eu":"Madagaskar","ca":"Madagascar","fr":"Madagascar","gl":"Madagascar","it":"Madagascar","de":"Madagaskar","pt":"Madagascar"},{"es":"Groenlandia","en":"Greenland","eu":"Groenlandia","ca":"Groenlandia","fr":"Groenland","gl":"Groenlandia","it":"Groenlandia","de":"Groenland","pt":"Groenlandia"},{"es":"Nueva Guinea","en":"New Guinea","eu":"Ginea Berria","ca":"Nova Guinea","fr":"Nouvelle-Guinee","gl":"Nova Guinea","it":"Nuova Guinea","de":"Neuguinea","pt":"Nova Guine"}]'::jsonb,
  2, 'geography'
),
-- Q77 animals hard
(
  '{"es":"¿Cuál es el animal con el periodo de gestación más corto?","en":"Which animal has the shortest gestation period?","eu":"Zein animaliak du haurdunaldi laburragoa?","ca":"Quin animal te el periode de gestacio mes curt?","fr":"Quel animal a la periode de gestation la plus courte?","gl":"Cal e o animal co periodo de xestacion mais curto?","it":"Quale animale ha il periodo di gestazione piu breve?","de":"Welches Tier hat die kuerzeste Tragzeit?","pt":"Qual animal tem o periodo de gestacao mais curto?"}'::jsonb,
  '[{"es":"Raton","en":"Mouse","eu":"Sagua","ca":"Ratoli","fr":"Souris","gl":"Rato","it":"Topo","de":"Maus","pt":"Rato"},{"es":"Zarigueya","en":"Opossum","eu":"Zarigueya","ca":"Zarigueya","fr":"Opossum","gl":"Zarigueya","it":"Opossum","de":"Opossum","pt":"Gamb"},{"es":"Conejo","en":"Rabbit","eu":"Untxia","ca":"Conill","fr":"Lapin","gl":"Coello","it":"Coniglio","de":"Kaninchen","pt":"Coelho"},{"es":"Hamster","en":"Hamster","eu":"Hamsterra","ca":"Hamster","fr":"Hamster","gl":"Hamster","it":"Criceto","de":"Hamster","pt":"Hamster"}]'::jsonb,
  1, 'animals'
),
-- Q78 technology hard
(
  '{"es":"¿En qué año se lanzó el primer satélite artificial al espacio?","en":"In what year was the first artificial satellite launched into space?","eu":"Zein urtetan jaurti zen lehen satélite artifiziala espaziora?","ca":"En quin any es va llancar el primer satel·lit artificial a l espai?","fr":"En quelle annee le premier satellite artificiel a-t-il ete lance dans l espace?","gl":"En que ano se lanzou o primeiro satélite artificial ao espazo?","it":"In che anno e stato lanciato il primo satellite artificiale nello spazio?","de":"In welchem Jahr wurde der erste kuenstliche Satellit ins All geschickt?","pt":"Em que ano foi lancado o primeiro satélite artificial ao espaco?"}'::jsonb,
  '[{"es":"1955","en":"1955","eu":"1955","ca":"1955","fr":"1955","gl":"1955","it":"1955","de":"1955","pt":"1955"},{"es":"1957","en":"1957","eu":"1957","ca":"1957","fr":"1957","gl":"1957","it":"1957","de":"1957","pt":"1957"},{"es":"1961","en":"1961","eu":"1961","ca":"1961","fr":"1961","gl":"1961","it":"1961","de":"1961","pt":"1961"},{"es":"1963","en":"1963","eu":"1963","ca":"1963","fr":"1963","gl":"1963","it":"1963","de":"1963","pt":"1963"}]'::jsonb,
  1, 'technology'
),
-- Q79 nature hard
(
  '{"es":"¿Cuál es el lugar más profundo del océaño?","en":"What is the deepest point in the ocean?","eu":"Zein da ozeanoko punturik sakonena?","ca":"Quin es el lloc mes profund de l ocea?","fr":"Quel est le point le plus profond de l ocean?","gl":"Cal e o lugar mais profundo do océano?","it":"Qual e il punto piu profondo dell océano?","de":"Was ist der tiefste Punkt im Ozean?","pt":"Qual e o ponto mais profundo do océano?"}'::jsonb,
  '[{"es":"Fosa de las Marianas","en":"Mariana Trench","eu":"Mariana Hobiak","ca":"Fossa de les Marianes","fr":"Fosse des Mariannes","gl":"Fosa das Marianas","it":"Fossa delle Marianne","de":"Marianengraben","pt":"Fossa das Marianas"},{"es":"Fosa de Tonga","en":"Tonga Trench","eu":"Tonga Hobia","ca":"Fossa de Tonga","fr":"Fosse de Tonga","gl":"Fosa de Tonga","it":"Fossa di Tonga","de":"Tongagraben","pt":"Fossa de Tonga"},{"es":"Fosa de Filipinas","en":"Philippine Trench","eu":"Filipinetako Hobia","ca":"Fossa de Filipines","fr":"Fosse des Philippines","gl":"Fosa de Filipinas","it":"Fossa delle Filippine","de":"Philippinengraben","pt":"Fossa das Filipinas"},{"es":"Fosa de Java","en":"Java Trench","eu":"Java Hobia","ca":"Fossa de Java","fr":"Fosse de Java","gl":"Fosa de Xava","it":"Fossa di Giava","de":"Javagraben","pt":"Fossa de Java"}]'::jsonb,
  0, 'nature'
),
-- Q80 food hard
(
  '{"es":"¿Cuál es la especia más cara del mundo?","en":"What is the most expensive spice in the world?","eu":"Zein da munduko espeziarik garestiena?","ca":"Quina es l especia mes cara del mon?","fr":"Quelle est l epice la plus chere du monde?","gl":"Cal e a especia mais cara do mundo?","it":"Qual e la spezia piu costosa del mondo?","de":"Was ist das teuerste Gewuerz der Welt?","pt":"Qual e a especiaria mais cara do mundo?"}'::jsonb,
  '[{"es":"Vainilla","en":"Vanilla","eu":"Bainila","ca":"Vainilla","fr":"Vanille","gl":"Vainilla","it":"Vaniglia","de":"Vanille","pt":"Baunilha"},{"es":"Azafrán","en":"Saffron","eu":"Azafrana","ca":"Safra","fr":"Safran","gl":"Azafran","it":"Zafferano","de":"Safran","pt":"Acafrao"},{"es":"Canela","en":"Cinnamon","eu":"Kanela","ca":"Canyella","fr":"Cannelle","gl":"Canela","it":"Cannella","de":"Zimt","pt":"Canela"},{"es":"Cardamomo","en":"Cardamom","eu":"Kardamomoa","ca":"Cardamom","fr":"Cardamome","gl":"Cardamomo","it":"Cardamomo","de":"Kardamom","pt":"Cardamomo"}]'::jsonb,
  1, 'food'
),
-- Q81 body hard
(
  '{"es":"¿Cuántos litros de sangre tiene aproximadamente un adulto?","en":"How many liters of blood does an adult have approximately?","eu":"Zenbat litro odol ditu gutxi gorabehera heldu batek?","ca":"Quants litres de sang te aproximadament un adult?","fr":"Combien de litres de sang un adulte possede-t-il environ?","gl":"Cantos litros de sangue ten aproximadamente un adulto?","it":"Quanti litri di sangue ha approssimativamente un adulto?","de":"Wie viele Liter Blut hat ein Erwachsener ungefaehr?","pt":"Quantos litros de sangue tem aproximadamente um adulto?"}'::jsonb,
  '[{"es":"3","en":"3","eu":"3","ca":"3","fr":"3","gl":"3","it":"3","de":"3","pt":"3"},{"es":"5","en":"5","eu":"5","ca":"5","fr":"5","gl":"5","it":"5","de":"5","pt":"5"},{"es":"7","en":"7","eu":"7","ca":"7","fr":"7","gl":"7","it":"7","de":"7","pt":"7"},{"es":"10","en":"10","eu":"10","ca":"10","fr":"10","gl":"10","it":"10","de":"10","pt":"10"}]'::jsonb,
  1, 'body'
),
-- Q82 cinema hard
(
  '{"es":"¿Cuálfue la primera película de animacion de Disney?","en":"What was Disney s first animated feature film?","eu":"Zein izan zen Disney-ren lehen animazio filma?","ca":"Quina va ser la primera pel·licula d animacio de Disney?","fr":"Quel fut le premier long-metrage d animation de Disney?","gl":"Cal foi a primeira película de animacion de Disney?","it":"Qual e stato il primo lungometraggio animato della Disney?","de":"Was war Disneys erster abendfuellender Zeichentrickfilm?","pt":"Qual foi o primeiro filme de animacao da Disney?"}'::jsonb,
  '[{"es":"Pinocho","en":"Pinocchio","eu":"Pinotxo","ca":"Pinotxo","fr":"Pinocchio","gl":"Pinocho","it":"Pinocchio","de":"Pinocchio","pt":"Pinoquio"},{"es":"Blancanieves y los siete enanitos","en":"Snow White and the Seven Dwarfs","eu":"Elurretxe eta zazpi ipotxak","ca":"Blancaneu i els set nans","fr":"Blanche-Neige et les Sept Nains","gl":"Brancaneves e os sete ananos","it":"Biancaneve e i sette nani","de":"Schneewittchen und die sieben Zwerge","pt":"Branca de Neve e os Sete Anoes"},{"es":"Fantasia","en":"Fantasia","eu":"Fantasia","ca":"Fantasia","fr":"Fantasia","gl":"Fantasia","it":"Fantasia","de":"Fantasia","pt":"Fantasia"},{"es":"Dumbo","en":"Dumbo","eu":"Dumbo","ca":"Dumbo","fr":"Dumbo","gl":"Dumbo","it":"Dumbo","de":"Dumbo","pt":"Dumbo"}]'::jsonb,
  1, 'cinema'
),
-- Q83 sports hard
(
  '{"es":"¿Cuántos anillos tiene el símbolo olímpico?","en":"How many rings does the Olympic symbol have?","eu":"Zenbat eraztun ditu ikur olinpikoak?","ca":"Quants anells te el simbol olimpic?","fr":"Combien d anneaux compte le symbole olympique?","gl":"Cantos aneis ten o símbolo olímpico?","it":"Quanti anelli ha il símbolo olímpico?","de":"Wie viele Ringe hat das olympische Symbol?","pt":"Quantos aneis tem o símbolo olímpico?"}'::jsonb,
  '[{"es":"4","en":"4","eu":"4","ca":"4","fr":"4","gl":"4","it":"4","de":"4","pt":"4"},{"es":"5","en":"5","eu":"5","ca":"5","fr":"5","gl":"5","it":"5","de":"5","pt":"5"},{"es":"6","en":"6","eu":"6","ca":"6","fr":"6","gl":"6","it":"6","de":"6","pt":"6"},{"es":"7","en":"7","eu":"7","ca":"7","fr":"7","gl":"7","it":"7","de":"7","pt":"7"}]'::jsonb,
  1, 'sports'
),
-- Q84 art hard
(
  '{"es":"¿Quién esculpió el David?","en":"Who sculpted the David?","eu":"Nork eskulturatu zuen David?","ca":"Qui va esculpir el David?","fr":"Qui a sculpte le David?","gl":"Quen esculpiu o David?","it":"Chi ha scolpito il David?","de":"Wer hat den David gemeisselt?","pt":"Quem esculpiu o David?"}'::jsonb,
  '[{"es":"Donatello","en":"Donatello","eu":"Donatello","ca":"Donatello","fr":"Donatello","gl":"Donatello","it":"Donatello","de":"Donatello","pt":"Donatello"},{"es":"Miguel Ángel","en":"Michelangelo","eu":"Michelangelo","ca":"Miquel Angel","fr":"Michel-Ange","gl":"Miguel Anxo","it":"Michelangelo","de":"Michelangelo","pt":"Miguel Angelo"},{"es":"Bernini","en":"Bernini","eu":"Bernini","ca":"Bernini","fr":"Bernini","gl":"Bernini","it":"Bernini","de":"Bernini","pt":"Bernini"},{"es":"Rafael","en":"Raphael","eu":"Rafael","ca":"Rafael","fr":"Raphael","gl":"Rafael","it":"Raffaello","de":"Raffael","pt":"Rafael"}]'::jsonb,
  1, 'art'
),
-- Q85 geography hard
(
  '{"es":"¿Cuál es la capital de Nueva Zelanda?","en":"What is the capital of New Zealand?","eu":"Zein da Zeelanda Berriko hiriburua?","ca":"Quina es la capital de Nova Zelanda?","fr":"Quelle est la capitale de la Nouvelle-Zelande?","gl":"Cal e a capital de Nova Zelandia?","it":"Qual e la capitale della Nuova Zelanda?","de":"Was ist die Hauptstadt von Neuseeland?","pt":"Qual e a capital da Nova Zelandia?"}'::jsonb,
  '[{"es":"Auckland","en":"Auckland","eu":"Auckland","ca":"Auckland","fr":"Auckland","gl":"Auckland","it":"Auckland","de":"Auckland","pt":"Auckland"},{"es":"Christchurch","en":"Christchurch","eu":"Christchurch","ca":"Christchurch","fr":"Christchurch","gl":"Christchurch","it":"Christchurch","de":"Christchurch","pt":"Christchurch"},{"es":"Wellington","en":"Wellington","eu":"Wellington","ca":"Wellington","fr":"Wellington","gl":"Wellington","it":"Wellington","de":"Wellington","pt":"Wellington"},{"es":"Queenstown","en":"Queenstown","eu":"Queenstown","ca":"Queenstown","fr":"Queenstown","gl":"Queenstown","it":"Queenstown","de":"Queenstown","pt":"Queenstown"}]'::jsonb,
  2, 'geography'
),
-- Q86 science hard
(
  '{"es":"¿Cuál es la partícula más pequeña de un elemento químico?","en":"What is the smallest particle of a chemical element?","eu":"Zein da elementu kimiko baten partikularik txikiena?","ca":"Quina es la partícula mes petita d un element quimic?","fr":"Quelle est la plus petite particule d un element chimique?","gl":"Cal e a partícula mais pequena dun elemento químico?","it":"Qual e la particella piu piccola di un elemento chimico?","de":"Was ist das kleinste Teilchen eines chemischen Elements?","pt":"Qual e a menor partícula de um elemento químico?"}'::jsonb,
  '[{"es":"Molecula","en":"Molecule","eu":"Molekula","ca":"Molecula","fr":"Molecule","gl":"Molecula","it":"Molecola","de":"Molekuel","pt":"Molecula"},{"es":"Atomo","en":"Atom","eu":"Atomoa","ca":"Atom","fr":"Atome","gl":"Atomo","it":"Atomo","de":"Atom","pt":"Atomo"},{"es":"Proton","en":"Proton","eu":"Protoia","ca":"Proto","fr":"Proton","gl":"Proton","it":"Protone","de":"Proton","pt":"Proton"},{"es":"Electron","en":"Electron","eu":"Elektroia","ca":"Electro","fr":"Electron","gl":"Electron","it":"Elettrone","de":"Elektron","pt":"Eletrao"}]'::jsonb,
  1, 'science'
),
-- Q87 history hard
(
  '{"es":"¿Quién fue el primer ser humano en el espacio?","en":"Who was the first human in space?","eu":"Nor izan zen espazioan egon zen lehen gizakia?","ca":"Qui va ser el primer esser huma a l espai?","fr":"Qui fut le premier etre humain dans l espace?","gl":"Quen foi o primeiro ser humano no espazo?","it":"Chi fu il primo essere umano nello spazio?","de":"Wer war der erste Mensch im Weltraum?","pt":"Quem foi o primeiro ser humano no espaco?"}'::jsonb,
  '[{"es":"Neil Armstrong","en":"Neil Armstrong","eu":"Neil Armstrong","ca":"Neil Armstrong","fr":"Neil Armstrong","gl":"Neil Armstrong","it":"Neil Armstrong","de":"Neil Armstrong","pt":"Neil Armstrong"},{"es":"Yuri Gagarin","en":"Yuri Gagarin","eu":"Yuri Gagarin","ca":"Iuri Gagarin","fr":"Youri Gagarine","gl":"Yuri Gagarin","it":"Jurij Gagarin","de":"Juri Gagarin","pt":"Yuri Gagarin"},{"es":"Buzz Aldrin","en":"Buzz Aldrin","eu":"Buzz Aldrin","ca":"Buzz Aldrin","fr":"Buzz Aldrin","gl":"Buzz Aldrin","it":"Buzz Aldrin","de":"Buzz Aldrin","pt":"Buzz Aldrin"},{"es":"Alan Shepard","en":"Alan Shepard","eu":"Alan Shepard","ca":"Alan Shepard","fr":"Alan Shepard","gl":"Alan Shepard","it":"Alan Shepard","de":"Alan Shepard","pt":"Alan Shepard"}]'::jsonb,
  1, 'history'
),
-- Q88 landmarks hard
(
  '{"es":"¿En qué país se encuentra la Gran Muralla?","en":"In which country is the Great Wall located?","eu":"Zein herrialdetan dago Harresi Handia?","ca":"A quin pais es troba la Gran Muralla?","fr":"Dans quel pays se trouve la Grande Muraille?","gl":"En que pais se atopa a Gran Muralla?","it":"In quale paese si trova la Grande Muraglia?","de":"In welchem Land befindet sich die Grosse Mauer?","pt":"Em que pais se encontra a Grande Muralha?"}'::jsonb,
  '[{"es":"Japón","en":"Japan","eu":"Japonia","ca":"Japo","fr":"Japon","gl":"Xapon","it":"Giappone","de":"Japan","pt":"Japao"},{"es":"Mongolia","en":"Mongolia","eu":"Mongolia","ca":"Mongolia","fr":"Mongolie","gl":"Mongolia","it":"Mongolia","de":"Mongolei","pt":"Mongolia"},{"es":"China","en":"China","eu":"Txina","ca":"Xina","fr":"Chine","gl":"China","it":"Cina","de":"China","pt":"China"},{"es":"Corea del Sur","en":"South Korea","eu":"Hego Korea","ca":"Corea del Sud","fr":"Coree du Sud","gl":"Corea do Sur","it":"Corea del Sud","de":"Suedkorea","pt":"Coreia do Sul"}]'::jsonb,
  2, 'landmarks'
),
-- Q89 food hard
(
  '{"es":"¿Qué fruto seco se usa para hacer mazapan?","en":"Which nut is used to make marzipan?","eu":"Zein intxaur mota erabiltzen da mazapana egiteko?","ca":"Quin fruit sec s utilitza per fer masso?","fr":"Quel fruit a coque utilise-t-on pour faire du massepain?","gl":"Que froito seco se usa para facer mazapan?","it":"Quale frutta secca si usa per fare il marzapane?","de":"Welche Nuss wird zur Herstellung von Marzipan verwendet?","pt":"Que fruto seco se usa para fazer marcapao?"}'::jsonb,
  '[{"es":"Nuez","en":"Walnut","eu":"Intxaurra","ca":"Nou","fr":"Noix","gl":"Noz","it":"Noce","de":"Walnuss","pt":"Noz"},{"es":"Pistacho","en":"Pistachio","eu":"Pistatxoa","ca":"Pistatxo","fr":"Pistache","gl":"Pistacho","it":"Pistacchio","de":"Pistazie","pt":"Pistache"},{"es":"Almendra","en":"Almond","eu":"Almendra","ca":"Ametlla","fr":"Amande","gl":"Almendra","it":"Mandorla","de":"Mandel","pt":"Amendoa"},{"es":"Avellana","en":"Hazelnut","eu":"Hurritza","ca":"Avellana","fr":"Noisette","gl":"Avela","it":"Nocciola","de":"Haselnuss","pt":"Avela"}]'::jsonb,
  2, 'food'
),
-- Q90 body hard
(
  '{"es":"¿Cuál es el hueso más pequeño del cuerpo humano?","en":"What is the smallest bone in the human body?","eu":"Zein da giza gorputzeko hezurrik txikiena?","ca":"Quin es l os mes petit del cos huma?","fr":"Quel est le plus petit os du corps humain?","gl":"Cal e o oso mais pequeno do corpo humano?","it":"Qual e l osso piu piccolo del corpo umano?","de":"Welcher ist der kleinste Knochen im menschlichen Koerper?","pt":"Qual e o menor osso do corpo humano?"}'::jsonb,
  '[{"es":"Estribo","en":"Stapes","eu":"Estribo","ca":"Estrep","fr":"Etrier","gl":"Estribo","it":"Staffa","de":"Steigbuegel","pt":"Estribo"},{"es":"Martillo","en":"Malleus","eu":"Mailua","ca":"Martell","fr":"Marteau","gl":"Martelo","it":"Martello","de":"Hammer","pt":"Martelo"},{"es":"Yunque","en":"Incus","eu":"Ingudea","ca":"Enclusa","fr":"Enclume","gl":"Xunque","it":"Incudine","de":"Amboss","pt":"Bigorna"},{"es":"Falange","en":"Phalanx","eu":"Falangea","ca":"Falange","fr":"Phalange","gl":"Falanxe","it":"Falange","de":"Phalanx","pt":"Falange"}]'::jsonb,
  0, 'body'
),
-- Q91 cinema hard
(
  '{"es":"¿Qué película ganó el primer Oscar a la mejor película?","en":"Which film won the first Academy Award for Best Picture?","eu":"Zein filmak irabazi zuen film onenaren lehen Oscar saria?","ca":"Quina pel·licula va guanyar el primer Oscar a la millor pel·licula?","fr":"Quel film a remporte le premier Oscar du meilleur film?","gl":"Que película ganou o primeiro Oscar a mellor película?","it":"Quale film ha vinto il primo Oscar come miglior film?","de":"Welcher Film gewann den ersten Oscar als bester Film?","pt":"Que filme ganhou o primeiro Oscar de melhor filme?"}'::jsonb,
  '[{"es":"Alas","en":"Wings","eu":"Hegoak","ca":"Ales","fr":"Les Ailes","gl":"As","it":"Ali","de":"Wings","pt":"Asas"},{"es":"El cantor de jazz","en":"The Jazz Singer","eu":"Jazz kantaria","ca":"El cantant de jazz","fr":"Le Chanteur de jazz","gl":"O cantante de jazz","it":"Il cantante di jazz","de":"Der Jazzsaenger","pt":"O Cantor de Jazz"},{"es":"Amanecer","en":"Sunrise","eu":"Egunsentia","ca":"Albada","fr":"L Aurore","gl":"Amencer","it":"Aurora","de":"Sonnenaufgang","pt":"Amanhecer"},{"es":"Ben-Hur","en":"Ben-Hur","eu":"Ben-Hur","ca":"Ben-Hur","fr":"Ben-Hur","gl":"Ben-Hur","it":"Ben-Hur","de":"Ben-Hur","pt":"Ben-Hur"}]'::jsonb,
  0, 'cinema'
),
-- Q92 sports hard
(
  '{"es":"¿Cuánto mide una pista de atletismo olímpica?","en":"How long is an Olympic athletics track?","eu":"Zenbat neurtzen du pista atletiko olinpiko batek?","ca":"Quant mesura una pista d atletisme olímpica?","fr":"Quelle est la longueur d une piste d athletisme olympique?","gl":"Canto mide unha pista de atletismo olímpica?","it":"Quanto misura una pista di atletica olímpica?","de":"Wie lang ist eine olympische Leichtathletikbahn?","pt":"Quanto mede uma pista de atletismo olímpica?"}'::jsonb,
  '[{"es":"200 metros","en":"200 meters","eu":"200 metro","ca":"200 metres","fr":"200 metres","gl":"200 metros","it":"200 metri","de":"200 Meter","pt":"200 metros"},{"es":"400 metros","en":"400 meters","eu":"400 metro","ca":"400 metres","fr":"400 metres","gl":"400 metros","it":"400 metri","de":"400 Meter","pt":"400 metros"},{"es":"500 metros","en":"500 meters","eu":"500 metro","ca":"500 metres","fr":"500 metres","gl":"500 metros","it":"500 metri","de":"500 Meter","pt":"500 metros"},{"es":"800 metros","en":"800 meters","eu":"800 metro","ca":"800 metres","fr":"800 metres","gl":"800 metros","it":"800 metri","de":"800 Meter","pt":"800 metros"}]'::jsonb,
  1, 'sports'
),
-- Q93 art hard
(
  '{"es":"¿Qué movimiento artístico lídero Salvador Dali?","en":"What art movement did Salvador Dali lead?","eu":"Zein arte-mugimendu zuzendu zuen Salvador Dalik?","ca":"Quin moviment artistic va líderar Salvador Dali?","fr":"Quel mouvement artistique Salvador Dali a-t-il dirige?","gl":"Que movemento artístico líderou Salvador Dali?","it":"Quale movimento artístico ha guidato Salvador Dali?","de":"Welche Kunstbewegung fuehrte Salvador Dali an?","pt":"Que movimento artístico líderou Salvador Dali?"}'::jsonb,
  '[{"es":"Impresionismo","en":"Impressionism","eu":"Inpresionismoa","ca":"Impressionisme","fr":"Impressionnisme","gl":"Impresionismo","it":"Impressionismo","de":"Impressionismus","pt":"Impressionismo"},{"es":"Cubismo","en":"Cubism","eu":"Kubismoa","ca":"Cubisme","fr":"Cubisme","gl":"Cubismo","it":"Cubismo","de":"Kubismus","pt":"Cubismo"},{"es":"Surrealismo","en":"Surrealism","eu":"Surrealismoa","ca":"Surrealisme","fr":"Surrealisme","gl":"Surrealismo","it":"Surrealismo","de":"Surrealismus","pt":"Surrealismo"},{"es":"Expresionismo","en":"Expressionism","eu":"Espresionismoa","ca":"Expressionisme","fr":"Expressionnisme","gl":"Expresionismo","it":"Espressionismo","de":"Expressionismus","pt":"Expressionismo"}]'::jsonb,
  2, 'art'
),
-- Q94 space hard
(
  '{"es":"¿Cuál es el nombre de la luna más grande de Júpiter?","en":"What is the name of Jupiter s largest moon?","eu":"Zein da Jupiterren ilargirik handienaren izena?","ca":"Quin es el nom de la lluna mes gran de Jupiter?","fr":"Quel est le nom de la plus grande lune de Jupiter?","gl":"Cal e o nome da lua mais grande de Xupiter?","it":"Qual e il nome della luna piu grande di Giove?","de":"Wie heisst der groesste Mond des Jupiter?","pt":"Qual e o nome da maior lua de Jupiter?"}'::jsonb,
  '[{"es":"Europa","en":"Europa","eu":"Europa","ca":"Europa","fr":"Europe","gl":"Europa","it":"Europa","de":"Europa","pt":"Europa"},{"es":"Io","en":"Io","eu":"Io","ca":"Io","fr":"Io","gl":"Io","it":"Io","de":"Io","pt":"Io"},{"es":"Ganimedes","en":"Ganymede","eu":"Ganimedes","ca":"Ganimedes","fr":"Ganymede","gl":"Ganimedes","it":"Ganimede","de":"Ganymed","pt":"Ganimedes"},{"es":"Calisto","en":"Callisto","eu":"Kalisto","ca":"Cal·listo","fr":"Callisto","gl":"Calisto","it":"Callisto","de":"Kallisto","pt":"Calisto"}]'::jsonb,
  2, 'space'
),
-- Q95 science hard
(
  '{"es":"¿Qué gas protege la Tierra de la radiación ultravioleta?","en":"What gas protects Earth from ultraviolet radiation?","eu":"Zein gasek babesten du Lurra erradiazio ultramoretatik?","ca":"Quin gas protegeix la Terra de la radiacio ultraviolada?","fr":"Quel gaz protege la Terre des rayons ultraviolets?","gl":"Que gas protexe a Terra da radiación ultravioleta?","it":"Quale gas protegge la Terra dalla radiazione ultravioletta?","de":"Welches Gas schuetzt die Erde vor ultravioletter Strahlung?","pt":"Que gas protege a Terra da radiacao ultravioleta?"}'::jsonb,
  '[{"es":"Oxígeno","en":"Oxygen","eu":"Oxigenoa","ca":"Oxigen","fr":"Oxygene","gl":"Osixeno","it":"Ossigeno","de":"Sauerstoff","pt":"Oxigenio"},{"es":"Nitrógeno","en":"Nitrogen","eu":"Nitrogenoa","ca":"Nitrogen","fr":"Azote","gl":"Nitroxeno","it":"Azoto","de":"Stickstoff","pt":"Nitrogenio"},{"es":"Ozono","en":"Ozone","eu":"Ozonoa","ca":"Ozo","fr":"Ozone","gl":"Ozono","it":"Ozono","de":"Ozon","pt":"Ozono"},{"es":"Helio","en":"Helium","eu":"Helioa","ca":"Heli","fr":"Helium","gl":"Helio","it":"Elio","de":"Helium","pt":"Helio"}]'::jsonb,
  2, 'science'
),
-- Q96 history hard
(
  '{"es":"¿Qué civilización antigua construyó Machu Picchu?","en":"Which ancient civilization built Machu Picchu?","eu":"Zein zibilizazio antzinarek eraiki zuen Machu Picchu?","ca":"Quina civilitzacio antiga va construir Machu Picchu?","fr":"Quelle civilisation ancienne a construit le Machu Picchu?","gl":"Que civilización antiga construiu Machu Picchu?","it":"Quale civilta antica ha costruito Machu Picchu?","de":"Welche alte Zivilisation hat Machu Picchu erbaut?","pt":"Que civilizacao antiga construiu Machu Picchu?"}'::jsonb,
  '[{"es":"Maya","en":"Maya","eu":"Maya","ca":"Maia","fr":"Maya","gl":"Maia","it":"Maya","de":"Maya","pt":"Maia"},{"es":"Azteca","en":"Aztec","eu":"Azteka","ca":"Asteca","fr":"Azteque","gl":"Azteca","it":"Azteca","de":"Azteken","pt":"Asteca"},{"es":"Inca","en":"Inca","eu":"Inka","ca":"Inca","fr":"Inca","gl":"Inca","it":"Inca","de":"Inka","pt":"Inca"},{"es":"Olmeca","en":"Olmec","eu":"Olmeka","ca":"Olmeca","fr":"Olmeque","gl":"Olmeca","it":"Olmeca","de":"Olmeken","pt":"Olmeca"}]'::jsonb,
  2, 'history'
),
-- Q97 technology hard
(
  '{"es":"¿Quién inventó la World Wide Web?","en":"Who invented the World Wide Web?","eu":"Nork asmatu zuen World Wide Web?","ca":"Qui va inventar la World Wide Web?","fr":"Qui a invente le World Wide Web?","gl":"Quen inventou a World Wide Web?","it":"Chi ha inventato il World Wide Web?","de":"Wer hat das World Wide Web erfunden?","pt":"Quem inventou a World Wide Web?"}'::jsonb,
  '[{"es":"Bill Gates","en":"Bill Gates","eu":"Bill Gates","ca":"Bill Gates","fr":"Bill Gates","gl":"Bill Gates","it":"Bill Gates","de":"Bill Gates","pt":"Bill Gates"},{"es":"Steve Jobs","en":"Steve Jobs","eu":"Steve Jobs","ca":"Steve Jobs","fr":"Steve Jobs","gl":"Steve Jobs","it":"Steve Jobs","de":"Steve Jobs","pt":"Steve Jobs"},{"es":"Tim Berners-Lee","en":"Tim Berners-Lee","eu":"Tim Berners-Lee","ca":"Tim Berners-Lee","fr":"Tim Berners-Lee","gl":"Tim Berners-Lee","it":"Tim Berners-Lee","de":"Tim Berners-Lee","pt":"Tim Berners-Lee"},{"es":"Vint Cerf","en":"Vint Cerf","eu":"Vint Cerf","ca":"Vint Cerf","fr":"Vint Cerf","gl":"Vint Cerf","it":"Vint Cerf","de":"Vint Cerf","pt":"Vint Cerf"}]'::jsonb,
  2, 'technology'
),
-- Q98 literature hard
(
  '{"es":"¿Quién escribió La Odisea?","en":"Who wrote The Odyssey?","eu":"Nork idatzi zuen Odisea?","ca":"Qui va escriure L Odissea?","fr":"Qui a ecrit L Odyssee?","gl":"Quen escribiu A Odisea?","it":"Chi ha scritto L Odissea?","de":"Wer schrieb die Odyssee?","pt":"Quem escreveu A Odisseia?"}'::jsonb,
  '[{"es":"Sofocles","en":"Sophocles","eu":"Sofokles","ca":"Sofocles","fr":"Sophocle","gl":"Sofocles","it":"Sofocle","de":"Sophokles","pt":"Sofocles"},{"es":"Homero","en":"Homer","eu":"Homero","ca":"Homer","fr":"Homere","gl":"Homero","it":"Omero","de":"Homer","pt":"Homero"},{"es":"Virgilio","en":"Virgil","eu":"Virgilio","ca":"Virgili","fr":"Virgile","gl":"Virxilio","it":"Virgilio","de":"Vergil","pt":"Virgilio"},{"es":"Aristoteles","en":"Aristotle","eu":"Aristoteles","ca":"Aristotil","fr":"Aristote","gl":"Aristoteles","it":"Aristotele","de":"Aristoteles","pt":"Aristoteles"}]'::jsonb,
  1, 'literature'
),
-- Q99 music hard
(
  '{"es":"¿Qué compositor escribió Las cuatro estaciones?","en":"Which composer wrote The Four Seasons?","eu":"Zein konpositorek idatzi zituen Lau urtaroak?","ca":"Quin compositor va escriure Les quatre estacions?","fr":"Quel compositeur a ecrit Les Quatre Saisons?","gl":"Que compositor escribiu As catro estacions?","it":"Quale compositore ha scritto Le quattro stagioni?","de":"Welcher Komponist schrieb Die vier Jahreszeiten?","pt":"Que compositor escreveu As Quatro Estacoes?"}'::jsonb,
  '[{"es":"Bach","en":"Bach","eu":"Bach","ca":"Bach","fr":"Bach","gl":"Bach","it":"Bach","de":"Bach","pt":"Bach"},{"es":"Mozart","en":"Mozart","eu":"Mozart","ca":"Mozart","fr":"Mozart","gl":"Mozart","it":"Mozart","de":"Mozart","pt":"Mozart"},{"es":"Vivaldi","en":"Vivaldi","eu":"Vivaldi","ca":"Vivaldi","fr":"Vivaldi","gl":"Vivaldi","it":"Vivaldi","de":"Vivaldi","pt":"Vivaldi"},{"es":"Handel","en":"Handel","eu":"Handel","ca":"Handel","fr":"Haendel","gl":"Handel","it":"Haendel","de":"Haendel","pt":"Handel"}]'::jsonb,
  2, 'music'
),
-- Q100 nature hard
(
  '{"es":"¿Cuál es el árbol más alto del mundo?","en":"What is the tallest tree in the world?","eu":"Zein da munduko zuhaitzik altuena?","ca":"Quin es l arbre mes alt del mon?","fr":"Quel est l arbre le plus grand du monde?","gl":"Cal e a arbore mais alta do mundo?","it":"Qual e l albero piu alto del mondo?","de":"Was ist der hoechste Baum der Welt?","pt":"Qual e a arvore mais alta do mundo?"}'::jsonb,
  '[{"es":"Secuoya gigante","en":"Giant sequoia","eu":"Sekuoia erraldoia","ca":"Sequoia gegant","fr":"Sequoia geant","gl":"Secuoia xigante","it":"Sequoia gigante","de":"Riesenmammutbaum","pt":"Sequoia gigante"},{"es":"Secuoya roja","en":"Coast redwood","eu":"Kostaldeko sekuoia gorria","ca":"Sequoia roja","fr":"Sequoia a feuilles d if","gl":"Secuoia vermella","it":"Sequoia sempervirens","de":"Kuesten-Mammutbaum","pt":"Sequoia vermelha"},{"es":"Eucalipto","en":"Eucalyptus","eu":"Eukaliptoa","ca":"Eucaliptus","fr":"Eucalyptus","gl":"Eucalipto","it":"Eucalipto","de":"Eukalyptus","pt":"Eucalipto"},{"es":"Abeto de Douglas","en":"Douglas fir","eu":"Douglas izeia","ca":"Avet de Douglas","fr":"Sapin de Douglas","gl":"Abeto de Douglas","it":"Abete di Douglas","de":"Douglasie","pt":"Abeto de Douglas"}]'::jsonb,
  1, 'nature'
),
-- Q101 animals hard
(
  '{"es":"¿Cuál es el ave más rápida del mundo?","en":"What is the fastest bird in the world?","eu":"Zein da munduko txoririk azkarrena?","ca":"Quin es l ocell mes rapid del mon?","fr":"Quel est l oiseau le plus rapide du monde?","gl":"Cal e a ave mais rápida do mundo?","it":"Qual e l uccello piu veloce del mondo?","de":"Welcher ist der schnellste Vogel der Welt?","pt":"Qual e a ave mais rápida do mundo?"}'::jsonb,
  '[{"es":"Águila real","en":"Golden eagle","eu":"Arrano beltza","ca":"Aguila reial","fr":"Aigle royal","gl":"Aguia real","it":"Aquila reale","de":"Steinadler","pt":"Aguia real"},{"es":"Halcón peregrino","en":"Peregrine falcon","eu":"Belatz handi","ca":"Falco pelgri","fr":"Faucon pelerin","gl":"Falcon peregrino","it":"Falco pellegrino","de":"Wanderfalke","pt":"Falcao peregrino"},{"es":"Vencejo","en":"Swift","eu":"Sorbeltz","ca":"Falciot","fr":"Martinet","gl":"Vencexo","it":"Rondone","de":"Mauersegler","pt":"Andorinhao"},{"es":"Colibrí","en":"Hummingbird","eu":"Kolibria","ca":"Colibri","fr":"Colibri","gl":"Colibri","it":"Colibri","de":"Kolibri","pt":"Colibri"}]'::jsonb,
  1, 'animals'
),
-- Q102 geography hard
(
  '{"es":"¿Cuál es el estrecho que separa Europa de África?","en":"What strait separates Europe from Africa?","eu":"Zein itsasarte banatzen ditu Europa eta Afrika?","ca":"Quin estret separa Europa d Africa?","fr":"Quel detroit separe l Europe de l Afrique?","gl":"Cal e o estreito que separa Europa de Africa?","it":"Quale stretto separa l Europa dall Africa?","de":"Welche Meerenge trennt Europa von Afrika?","pt":"Qual e o estreito que separa a Europa da Africa?"}'::jsonb,
  '[{"es":"Estrecho de Bering","en":"Bering Strait","eu":"Beringen itsasartea","ca":"Estret de Bering","fr":"Detroit de Bering","gl":"Estreito de Bering","it":"Stretto di Bering","de":"Beringstrasse","pt":"Estreito de Bering"},{"es":"Estrecho de Gibraltar","en":"Strait of Gibraltar","eu":"Gibraltarko itsasartea","ca":"Estret de Gibraltar","fr":"Detroit de Gibraltar","gl":"Estreito de Xibraltar","it":"Stretto di Gibilterra","de":"Strasse von Gibraltar","pt":"Estreito de Gibraltar"},{"es":"Canal de Suez","en":"Suez Canal","eu":"Suezko kanala","ca":"Canal de Suez","fr":"Canal de Suez","gl":"Canle de Suez","it":"Canale di Suez","de":"Suezkanal","pt":"Canal de Suez"},{"es":"Estrecho de Malaca","en":"Strait of Malacca","eu":"Malakako itsasartea","ca":"Estret de Malacca","fr":"Detroit de Malacca","gl":"Estreito de Malaca","it":"Stretto di Malacca","de":"Strasse von Malakka","pt":"Estreito de Malaca"}]'::jsonb,
  1, 'geography'
),
-- Q103 food hard
(
  '{"es":"¿De qué cereal se elabora el sake japonés?","en":"From which grain is Japanese sake made?","eu":"Zein zerealetik egiten da sake japonésa?","ca":"De quin cereal s elabora el sake japonés?","fr":"A partir de quelle cereale le sake japonais est-il fabrique?","gl":"De que cereal se elabora o sake xapones?","it":"Da quale cereale si produce il sake giapponese?","de":"Aus welchem Getreide wird japanischer Sake hergestellt?","pt":"De que cereal e feito o sake japonés?"}'::jsonb,
  '[{"es":"Trigo","en":"Wheat","eu":"Garia","ca":"Blat","fr":"Ble","gl":"Trigo","it":"Grano","de":"Weizen","pt":"Trigo"},{"es":"Cebada","en":"Barley","eu":"Garagarra","ca":"Ordi","fr":"Orge","gl":"Cebada","it":"Orzo","de":"Gerste","pt":"Cevada"},{"es":"Arroz","en":"Rice","eu":"Arroza","ca":"Arros","fr":"Riz","gl":"Arroz","it":"Riso","de":"Reis","pt":"Arroz"},{"es":"Maiz","en":"Corn","eu":"Artoa","ca":"Blat de moro","fr":"Mais","gl":"Millo","it":"Mais","de":"Mais","pt":"Milho"}]'::jsonb,
  2, 'food'
),
-- Q104 body hard
(
  '{"es":"¿Cuántos pares de nervios craneales tiene el ser humano?","en":"How many pairs of cranial nerves does a human have?","eu":"Zenbat garezur-nerbio pare ditu gizakiak?","ca":"Quants parells de nervis cranials te l esser huma?","fr":"Combien de paires de nerfs craniens l etre humain possede-t-il?","gl":"Cantos pares de nervios craneais ten o ser humano?","it":"Quante paia di nervi cranici ha l essere umano?","de":"Wie viele Hirnnervenpaare hat der Mensch?","pt":"Quantos pares de nervos cranianos tem o ser humano?"}'::jsonb,
  '[{"es":"8","en":"8","eu":"8","ca":"8","fr":"8","gl":"8","it":"8","de":"8","pt":"8"},{"es":"10","en":"10","eu":"10","ca":"10","fr":"10","gl":"10","it":"10","de":"10","pt":"10"},{"es":"12","en":"12","eu":"12","ca":"12","fr":"12","gl":"12","it":"12","de":"12","pt":"12"},{"es":"14","en":"14","eu":"14","ca":"14","fr":"14","gl":"14","it":"14","de":"14","pt":"14"}]'::jsonb,
  2, 'body'
),
-- Q105 cinema hard
(
  '{"es":"¿Qué director es conocido por películas como Pulp Fiction?","en":"Which director is known for films like Pulp Fiction?","eu":"Zein zuzendari da ezaguna Pulp Fiction bezalako filmengatik?","ca":"Quin director es conegut per pel·licules com Pulp Fiction?","fr":"Quel realisateur est connu pour des films comme Pulp Fiction?","gl":"Que director e conecido por películas como Pulp Fiction?","it":"Quale regista e noto per film come Pulp Fiction?","de":"Welcher Regisseur ist fuer Filme wie Pulp Fiction bekannt?","pt":"Que realizador e conhecido por filmes como Pulp Fiction?"}'::jsonb,
  '[{"es":"Martin Scorsese","en":"Martin Scorsese","eu":"Martin Scorsese","ca":"Martin Scorsese","fr":"Martin Scorsese","gl":"Martin Scorsese","it":"Martin Scorsese","de":"Martin Scorsese","pt":"Martin Scorsese"},{"es":"Quentin Tarantino","en":"Quentin Tarantino","eu":"Quentin Tarantino","ca":"Quentin Tarantino","fr":"Quentin Tarantino","gl":"Quentin Tarantino","it":"Quentin Tarantino","de":"Quentin Tarantino","pt":"Quentin Tarantino"},{"es":"David Fincher","en":"David Fincher","eu":"David Fincher","ca":"David Fincher","fr":"David Fincher","gl":"David Fincher","it":"David Fincher","de":"David Fincher","pt":"David Fincher"},{"es":"Guy Ritchie","en":"Guy Ritchie","eu":"Guy Ritchie","ca":"Guy Ritchie","fr":"Guy Ritchie","gl":"Guy Ritchie","it":"Guy Ritchie","de":"Guy Ritchie","pt":"Guy Ritchie"}]'::jsonb,
  1, 'cinema'
),
-- Q106 sports hard
(
  '{"es":"¿Cuántos jugadores tiene un equipo de rugby en el campo?","en":"How many players does a rugby team have on the field?","eu":"Zenbat jokalari ditu rugby talde batek zelaian?","ca":"Quants jugadors te un equip de rugbi al camp?","fr":"Combien de joueurs une equipe de rugby a-t-elle sur le terrain?","gl":"Cantos xogadores ten un equipo de rugby no campo?","it":"Quanti giocatori ha una squadra di rugby in campo?","de":"Wie viele Spieler hat eine Rugby-Mannschaft auf dem Feld?","pt":"Quantos jogadores tem uma equipa de rugby em campo?"}'::jsonb,
  '[{"es":"11","en":"11","eu":"11","ca":"11","fr":"11","gl":"11","it":"11","de":"11","pt":"11"},{"es":"13","en":"13","eu":"13","ca":"13","fr":"13","gl":"13","it":"13","de":"13","pt":"13"},{"es":"15","en":"15","eu":"15","ca":"15","fr":"15","gl":"15","it":"15","de":"15","pt":"15"},{"es":"17","en":"17","eu":"17","ca":"17","fr":"17","gl":"17","it":"17","de":"17","pt":"17"}]'::jsonb,
  2, 'sports'
),
-- Q107 landmarks hard
(
  '{"es":"¿En qué ciudad se encuentra la Sagrada Familia?","en":"In which city is the Sagrada Familia located?","eu":"Zein hiritan dago Sagrada Familia?","ca":"A quina ciutat es troba la Sagrada Familia?","fr":"Dans quelle ville se trouve la Sagrada Familia?","gl":"En que cidade esta a Sagrada Familia?","it":"In quale citta si trova la Sagrada Familia?","de":"In welcher Stadt befindet sich die Sagrada Familia?","pt":"Em que cidade se encontra a Sagrada Familia?"}'::jsonb,
  '[{"es":"Madrid","en":"Madrid","eu":"Madril","ca":"Madrid","fr":"Madrid","gl":"Madrid","it":"Madrid","de":"Madrid","pt":"Madrid"},{"es":"Barcelona","en":"Barcelona","eu":"Bartzelona","ca":"Barcelona","fr":"Barcelone","gl":"Barcelona","it":"Barcellona","de":"Barcelona","pt":"Barcelona"},{"es":"Valencia","en":"Valencia","eu":"Valentzia","ca":"Valencia","fr":"Valence","gl":"Valencia","it":"Valencia","de":"Valencia","pt":"Valencia"},{"es":"Sevilla","en":"Seville","eu":"Sevilla","ca":"Sevilla","fr":"Seville","gl":"Sevilla","it":"Siviglia","de":"Sevilla","pt":"Sevilha"}]'::jsonb,
  1, 'landmarks'
),
-- Q108 technology hard
(
  '{"es":"¿Qué lenguaje de programación creó Guido van Rossum?","en":"Which programming language did Guido van Rossum create?","eu":"Zein programazio-lengoaia sortu zuen Guido van Rossum-ek?","ca":"Quin llenguatge de programacio va crear Guido van Rossum?","fr":"Quel langage de programmation Guido van Rossum a-t-il cree?","gl":"Que linguaxe de programación creou Guido van Rossum?","it":"Quale linguaggio di programmazione ha creato Guido van Rossum?","de":"Welche Programmiersprache hat Guido van Rossum entwickelt?","pt":"Que linguagem de programacao criou Guido van Rossum?"}'::jsonb,
  '[{"es":"Java","en":"Java","eu":"Java","ca":"Java","fr":"Java","gl":"Java","it":"Java","de":"Java","pt":"Java"},{"es":"Ruby","en":"Ruby","eu":"Ruby","ca":"Ruby","fr":"Ruby","gl":"Ruby","it":"Ruby","de":"Ruby","pt":"Ruby"},{"es":"Python","en":"Python","eu":"Python","ca":"Python","fr":"Python","gl":"Python","it":"Python","de":"Python","pt":"Python"},{"es":"JavaScript","en":"JavaScript","eu":"JavaScript","ca":"JavaScript","fr":"JavaScript","gl":"JavaScript","it":"JavaScript","de":"JavaScript","pt":"JavaScript"}]'::jsonb,
  2, 'technology'
),
-- Q109 literature hard
(
  '{"es":"¿Quién escribió El Principito?","en":"Who wrote The Little Prince?","eu":"Nork idatzi zuen Printze Txikia?","ca":"Qui va escriure El Petit Princep?","fr":"Qui a ecrit Le Petit Prince?","gl":"Quen escribiu O Principiño?","it":"Chi ha scritto Il Piccolo Principe?","de":"Wer schrieb Der Kleine Prinz?","pt":"Quem escreveu O Principezinho?"}'::jsonb,
  '[{"es":"Victor Hugo","en":"Victor Hugo","eu":"Victor Hugo","ca":"Victor Hugo","fr":"Victor Hugo","gl":"Victor Hugo","it":"Victor Hugo","de":"Victor Hugo","pt":"Victor Hugo"},{"es":"Antoine de Saint-Exupery","en":"Antoine de Saint-Exupery","eu":"Antoine de Saint-Exupery","ca":"Antoine de Saint-Exupery","fr":"Antoine de Saint-Exupery","gl":"Antoine de Saint-Exupery","it":"Antoine de Saint-Exupery","de":"Antoine de Saint-Exupery","pt":"Antoine de Saint-Exupery"},{"es":"Albert Camus","en":"Albert Camus","eu":"Albert Camus","ca":"Albert Camus","fr":"Albert Camus","gl":"Albert Camus","it":"Albert Camus","de":"Albert Camus","pt":"Albert Camus"},{"es":"Jules Verne","en":"Jules Verne","eu":"Jules Verne","ca":"Jules Verne","fr":"Jules Verne","gl":"Jules Verne","it":"Jules Verne","de":"Jules Verne","pt":"Jules Verne"}]'::jsonb,
  1, 'literature'
),
-- Q110 music hard
(
  '{"es":"¿Qué compositor quedo sordo y siguio componiendo?","en":"Which composer became deaf and continued composing?","eu":"Zein konpositorek gelditu zen gor eta jarraitu zuen konposatzen?","ca":"Quin compositor va quedar sord i va continuar component?","fr":"Quel compositeur est devenu sourd et a continue a composer?","gl":"Que compositor quedou xordo e seguiu compoñendo?","it":"Quale compositore divenne sordo e continuo a comporre?","de":"Welcher Komponist wurde taub und komponierte weiter?","pt":"Que compositor ficou surdo e continuou a compor?"}'::jsonb,
  '[{"es":"Mozart","en":"Mozart","eu":"Mozart","ca":"Mozart","fr":"Mozart","gl":"Mozart","it":"Mozart","de":"Mozart","pt":"Mozart"},{"es":"Beethoven","en":"Beethoven","eu":"Beethoven","ca":"Beethoven","fr":"Beethoven","gl":"Beethoven","it":"Beethoven","de":"Beethoven","pt":"Beethoven"},{"es":"Bach","en":"Bach","eu":"Bach","ca":"Bach","fr":"Bach","gl":"Bach","it":"Bach","de":"Bach","pt":"Bach"},{"es":"Chopin","en":"Chopin","eu":"Chopin","ca":"Chopin","fr":"Chopin","gl":"Chopin","it":"Chopin","de":"Chopin","pt":"Chopin"}]'::jsonb,
  1, 'music'
),
-- Q111 science hard
(
  '{"es":"¿Qué metal es líquido a temperatura ambiente?","en":"Which metal is liquid at room temperature?","eu":"Zein metal da likidoa giro-tenperaturan?","ca":"Quin metall es liquid a temperatura ambient?","fr":"Quel metal est liquide a temperature ambiante?","gl":"Que metal e líquido a temperatura ambiente?","it":"Quale metallo e líquido a temperatura ambiente?","de":"Welches Metall ist bei Raumtemperatur fluessig?","pt":"Que metal e líquido a temperatura ambiente?"}'::jsonb,
  '[{"es":"Plomo","en":"Lead","eu":"Beruna","ca":"Plom","fr":"Plomb","gl":"Chumbo","it":"Piombo","de":"Blei","pt":"Chumbo"},{"es":"Mercurio","en":"Mercury","eu":"Merkurioa","ca":"Mercuri","fr":"Mercure","gl":"Mercurio","it":"Mercurio","de":"Quecksilber","pt":"Mercurio"},{"es":"Aluminio","en":"Aluminum","eu":"Aluminioa","ca":"Alumini","fr":"Aluminium","gl":"Aluminio","it":"Alluminio","de":"Aluminium","pt":"Aluminio"},{"es":"Zinc","en":"Zinc","eu":"Zinka","ca":"Zinc","fr":"Zinc","gl":"Zinc","it":"Zinco","de":"Zink","pt":"Zinco"}]'::jsonb,
  1, 'science'
),
-- Q112 animals hard
(
  '{"es":"¿Qué animal tiene la lengua más larga en proporción a su cuerpo?","en":"Which animal has the longest tongue relative to its body?","eu":"Zein animaliak du gorputzarekiko mihirik luzeena?","ca":"Quin animal te la llengua mes llarga en proporcio al seu cos?","fr":"Quel animal a la langue la plus longue par rapport a son corps?","gl":"Que animal ten a lingua mais longa en proporción ao seu corpo?","it":"Quale animale ha la lingua piu lunga in proporzione al corpo?","de":"Welches Tier hat die laengste Zunge im Verhaeltnis zu seinem Koerper?","pt":"Que animal tem a lingua mais longa em proporcao ao seu corpo?"}'::jsonb,
  '[{"es":"Jirafa","en":"Giraffe","eu":"Jirafa","ca":"Girafa","fr":"Girafe","gl":"Xirafa","it":"Giraffa","de":"Giraffe","pt":"Girafa"},{"es":"Camaleon","en":"Chameleon","eu":"Kameleoia","ca":"Camaleó","fr":"Cameleon","gl":"Camaleon","it":"Camaleonte","de":"Chamaeleon","pt":"Camaleao"},{"es":"Oso hormiguero","en":"Anteater","eu":"Inurrija","ca":"Os formiguer","fr":"Fourmilier","gl":"Oso formigueiro","it":"Formichiere","de":"Ameisenbär","pt":"Tamandua"},{"es":"Rana","en":"Frog","eu":"Igela","ca":"Granota","fr":"Grenouille","gl":"Ra","it":"Rana","de":"Frosch","pt":"Ra"}]'::jsonb,
  1, 'animals'
),
-- Q113 geography hard
(
  '{"es":"¿Cuál es el país más pequeño del mundo?","en":"What is the smallest country in the world?","eu":"Zein da munduko herrialderik txikiena?","ca":"Quin es el pais mes petit del mon?","fr":"Quel est le plus petit pays du monde?","gl":"Cal e o pais mais pequeno do mundo?","it":"Qual e il paese piu piccolo del mondo?","de":"Welches ist das kleinste Land der Welt?","pt":"Qual e o menor pais do mundo?"}'::jsonb,
  '[{"es":"Monaco","en":"Monaco","eu":"Monako","ca":"Monaco","fr":"Monaco","gl":"Monaco","it":"Monaco","de":"Monaco","pt":"Monaco"},{"es":"Vaticano","en":"Vatican City","eu":"Vatikanoa","ca":"Vatica","fr":"Vatican","gl":"Vaticano","it":"Citta del Vaticano","de":"Vatikanstadt","pt":"Vaticano"},{"es":"San Marino","en":"San Marino","eu":"San Marino","ca":"San Marino","fr":"Saint-Marin","gl":"San Marino","it":"San Marino","de":"San Marino","pt":"San Marino"},{"es":"Liechtenstein","en":"Liechtenstein","eu":"Liechtenstein","ca":"Liechtenstein","fr":"Liechtenstein","gl":"Liechtenstein","it":"Liechtenstein","de":"Liechtenstein","pt":"Liechtenstein"}]'::jsonb,
  1, 'geography'
),
-- Q114 history hard
(
  '{"es":"¿Quién fue el líder de la India en su independencia en 1947?","en":"Who was the leader of India at its independence in 1947?","eu":"Nor izan zen Indiako buruzagia 1947an independentzia lortu zuenean?","ca":"Qui va ser el líder de l India en la seva independencia el 1947?","fr":"Qui etait le leader de l Inde lors de son independance en 1947?","gl":"Quen foi o líder da India na sua independencia en 1947?","it":"Chi era il leader dell India alla sua indipendenza nel 1947?","de":"Wer war der Fuehrer Indiens bei seiner Unabhaengigkeit 1947?","pt":"Quem foi o líder da India na sua independencia em 1947?"}'::jsonb,
  '[{"es":"Mahatma Gandhi","en":"Mahatma Gandhi","eu":"Mahatma Gandhi","ca":"Mahatma Gandhi","fr":"Mahatma Gandhi","gl":"Mahatma Gandhi","it":"Mahatma Gandhi","de":"Mahatma Gandhi","pt":"Mahatma Gandhi"},{"es":"Jawaharlal Nehru","en":"Jawaharlal Nehru","eu":"Jawaharlal Nehru","ca":"Jawaharlal Nehru","fr":"Jawaharlal Nehru","gl":"Jawaharlal Nehru","it":"Jawaharlal Nehru","de":"Jawaharlal Nehru","pt":"Jawaharlal Nehru"},{"es":"Subhas Chandra Bose","en":"Subhas Chandra Bose","eu":"Subhas Chandra Bose","ca":"Subhas Chandra Bose","fr":"Subhas Chandra Bose","gl":"Subhas Chandra Bose","it":"Subhas Chandra Bose","de":"Subhas Chandra Bose","pt":"Subhas Chandra Bose"},{"es":"Bhagat Singh","en":"Bhagat Singh","eu":"Bhagat Singh","ca":"Bhagat Singh","fr":"Bhagat Singh","gl":"Bhagat Singh","it":"Bhagat Singh","de":"Bhagat Singh","pt":"Bhagat Singh"}]'::jsonb,
  0, 'history'
),
-- Q115 space hard
(
  '{"es":"¿Qué tipo de estrella es el Sol?","en":"What type of star is the Sun?","eu":"Zer izar mota da Eguzkia?","ca":"Quin tipus d estel es el Sol?","fr":"Quel type d etoile est le Soleil?","gl":"Que tipo de estrela e o Sol?","it":"Che tipo di stella e il Sole?","de":"Was fuer ein Stern ist die Sonne?","pt":"Que tipo de estrela e o Sol?"}'::jsonb,
  '[{"es":"Gigante roja","en":"Red giant","eu":"Erraldoi gorria","ca":"Gegant vermella","fr":"Geante rouge","gl":"Xigante vermella","it":"Gigante rossa","de":"Roter Riese","pt":"Gigante vermelha"},{"es":"Enana blanca","en":"White dwarf","eu":"Nano zuria","ca":"Nana blanca","fr":"Naine blanche","gl":"Anana branca","it":"Nana bianca","de":"Weisser Zwerg","pt":"Ana branca"},{"es":"Enana amarilla","en":"Yellow dwarf","eu":"Nano horia","ca":"Nana groga","fr":"Naine jaune","gl":"Anana amarela","it":"Nana gialla","de":"Gelber Zwerg","pt":"Ana amarela"},{"es":"Supergigante","en":"Supergiant","eu":"Supererraldoia","ca":"Supergegant","fr":"Supergeante","gl":"Superxigante","it":"Supergigante","de":"Ueberriese","pt":"Supergigante"}]'::jsonb,
  2, 'space'
),
-- Q116 nature hard
(
  '{"es":"¿Cuál es el río más caudaloso del mundo?","en":"What is the river with the largest volume of water in the world?","eu":"Zein da munduko ibairik emari handienekoa?","ca":"Quin es el riu amb mes cabal del mon?","fr":"Quel est le fleuve au plus grand debit du monde?","gl":"Cal e o rio con maior caudal do mundo?","it":"Qual e il fiume con la maggiore portata del mondo?","de":"Welcher Fluss hat die groesste Wassermenge der Welt?","pt":"Qual e o rio com maior volume de agua do mundo?"}'::jsonb,
  '[{"es":"Nilo","en":"Nile","eu":"Nilo","ca":"Nil","fr":"Nil","gl":"Nilo","it":"Nilo","de":"Nil","pt":"Nilo"},{"es":"Misisipi","en":"Mississippi","eu":"Misisipi","ca":"Mississipí","fr":"Mississippi","gl":"Misisipi","it":"Mississippi","de":"Mississippi","pt":"Mississippi"},{"es":"Amazonas","en":"Amazon","eu":"Amazonas","ca":"Amazones","fr":"Amazone","gl":"Amazonas","it":"Rio delle Amazzoni","de":"Amazonas","pt":"Amazonas"},{"es":"Yangtsé","en":"Yangtze","eu":"Yangtze","ca":"Iangtse","fr":"Yangtsé","gl":"Yangtsé","it":"Yangzi Jiang","de":"Jangtsekiang","pt":"Yangtzé"}]'::jsonb,
  2, 'nature'
),
-- Q117 food hard
(
  '{"es":"¿Qué país es el mayor productor de café del mundo?","en":"Which country is the largest coffee producer in the world?","eu":"Zein herrialde da munduko kafe ekoizle handiena?","ca":"Quin países el major productor de cafe del mon?","fr":"Quel pays est le plus grand producteur de cafe au monde?","gl":"Que paíse o maior produtor de cafe do mundo?","it":"Quale paese e il maggior produttore di caffe al mondo?","de":"Welches Land ist der groesste Kaffeeproduzent der Welt?","pt":"Que paíse o maior produtor de cafe do mundo?"}'::jsonb,
  '[{"es":"Colombia","en":"Colombia","eu":"Kolonbia","ca":"Colombia","fr":"Colombie","gl":"Colombia","it":"Colombia","de":"Kolumbien","pt":"Colombia"},{"es":"Brasil","en":"Brazil","eu":"Brasil","ca":"Brasil","fr":"Bresil","gl":"Brasil","it":"Brasile","de":"Brasilien","pt":"Brasil"},{"es":"Vietnam","en":"Vietnam","eu":"Vietnam","ca":"Vietnam","fr":"Vietnam","gl":"Vietnam","it":"Vietnam","de":"Vietnam","pt":"Vietname"},{"es":"Etiopia","en":"Ethiopia","eu":"Etiopia","ca":"Etiopia","fr":"Ethiopie","gl":"Etiopia","it":"Etiopia","de":"Aethiopien","pt":"Etiopia"}]'::jsonb,
  1, 'food'
),
-- Q118 art hard
(
  '{"es":"¿Qué pintor creó el Guernica?","en":"Which painter created Guernica?","eu":"Zein margolarik sortu zuen Guernica?","ca":"Quin pintor va crear el Guernica?","fr":"Quel peintre a cree Guernica?","gl":"Que pintor creou o Guernica?","it":"Quale pittore ha creato Guernica?","de":"Welcher Maler hat Guernica geschaffen?","pt":"Que pintor criou o Guernica?"}'::jsonb,
  '[{"es":"Salvador Dali","en":"Salvador Dali","eu":"Salvador Dali","ca":"Salvador Dali","fr":"Salvador Dali","gl":"Salvador Dali","it":"Salvador Dali","de":"Salvador Dali","pt":"Salvador Dali"},{"es":"Pablo Picasso","en":"Pablo Picasso","eu":"Pablo Picasso","ca":"Pablo Picasso","fr":"Pablo Picasso","gl":"Pablo Picasso","it":"Pablo Picasso","de":"Pablo Picasso","pt":"Pablo Picasso"},{"es":"Joan Miro","en":"Joan Miro","eu":"Joan Miro","ca":"Joan Miro","fr":"Joan Miro","gl":"Joan Miro","it":"Joan Miro","de":"Joan Miro","pt":"Joan Miro"},{"es":"Francisco de Goya","en":"Francisco de Goya","eu":"Francisco de Goya","ca":"Francisco de Goya","fr":"Francisco de Goya","gl":"Francisco de Goya","it":"Francisco de Goya","de":"Francisco de Goya","pt":"Francisco de Goya"}]'::jsonb,
  1, 'art'
),
-- Q119 sports hard
(
  '{"es":"¿Cuántos puntos vale un touchdown en fútbol americano?","en":"How many points is a touchdown worth in American football?","eu":"Zenbat puntu balio du touchdown batek fútbol amerikarrean?","ca":"Quants punts val un touchdown en fútbol america?","fr":"Combien de points vaut un touchdown au football americain?","gl":"Cantos puntos vale un touchdown en fútbol americano?","it":"Quanti punti vale un touchdown nel football americano?","de":"Wie viele Punkte ist ein Touchdown im American Football wert?","pt":"Quantos pontos vale um touchdown no futebol americano?"}'::jsonb,
  '[{"es":"3","en":"3","eu":"3","ca":"3","fr":"3","gl":"3","it":"3","de":"3","pt":"3"},{"es":"6","en":"6","eu":"6","ca":"6","fr":"6","gl":"6","it":"6","de":"6","pt":"6"},{"es":"7","en":"7","eu":"7","ca":"7","fr":"7","gl":"7","it":"7","de":"7","pt":"7"},{"es":"10","en":"10","eu":"10","ca":"10","fr":"10","gl":"10","it":"10","de":"10","pt":"10"}]'::jsonb,
  1, 'sports'
),
-- Q120 landmarks hard
(
  '{"es":"¿Quién diseñó la Sagrada Familia de Barcelona?","en":"Who designed the Sagrada Familia in Barcelona?","eu":"Nork diseinatu zuen Bartzelonako Sagrada Familia?","ca":"Qui va dissenyar la Sagrada Familia de Barcelona?","fr":"Qui a concu la Sagrada Familia de Barcelone?","gl":"Quen deseñou a Sagrada Familia de Barcelona?","it":"Chi ha progettato la Sagrada Familia di Barcellona?","de":"Wer hat die Sagrada Familia in Barcelona entworfen?","pt":"Quem projetou a Sagrada Familia de Barcelona?"}'::jsonb,
  '[{"es":"Antoni Gaudi","en":"Antoni Gaudi","eu":"Antoni Gaudi","ca":"Antoni Gaudi","fr":"Antoni Gaudi","gl":"Antoni Gaudi","it":"Antoni Gaudi","de":"Antoni Gaudi","pt":"Antoni Gaudi"},{"es":"Santiago Calatrava","en":"Santiago Calatrava","eu":"Santiago Calatrava","ca":"Santiago Calatrava","fr":"Santiago Calatrava","gl":"Santiago Calatrava","it":"Santiago Calatrava","de":"Santiago Calatrava","pt":"Santiago Calatrava"},{"es":"Oscar Niemeyer","en":"Oscar Niemeyer","eu":"Oscar Niemeyer","ca":"Oscar Niemeyer","fr":"Oscar Niemeyer","gl":"Oscar Niemeyer","it":"Oscar Niemeyer","de":"Oscar Niemeyer","pt":"Oscar Niemeyer"},{"es":"Le Corbusier","en":"Le Corbusier","eu":"Le Corbusier","ca":"Le Corbusier","fr":"Le Corbusier","gl":"Le Corbusier","it":"Le Corbusier","de":"Le Corbusier","pt":"Le Corbusier"}]'::jsonb,
  0, 'landmarks'
),
-- Q121 body hard
(
  '{"es":"¿Cuál es la vitamina que produce el cuerpo al exponerse al sol?","en":"Which vitamin does the body produce when exposed to sunlight?","eu":"Zein bitamina ekoizten du gorputzak eguzkiaren argira jartzean?","ca":"Quina vitamina produeix el cos quan s exposa al sol?","fr":"Quelle vitamine le corps produit-il lorsqu il est expose au soleil?","gl":"Que vitamina produce o corpo ao expoñerse ao sol?","it":"Quale vitamina produce il corpo quando esposto al sole?","de":"Welches Vitamin produziert der Koerper bei Sonneneinstrahlung?","pt":"Que vitamina o corpo produz quando exposto ao sol?"}'::jsonb,
  '[{"es":"Vitamina A","en":"Vitamin A","eu":"A bitamina","ca":"Vitamina A","fr":"Vitamine A","gl":"Vitamina A","it":"Vitamina A","de":"Vitamin A","pt":"Vitamina A"},{"es":"Vitamina B","en":"Vitamin B","eu":"B bitamina","ca":"Vitamina B","fr":"Vitamine B","gl":"Vitamina B","it":"Vitamina B","de":"Vitamin B","pt":"Vitamina B"},{"es":"Vitamina C","en":"Vitamin C","eu":"C bitamina","ca":"Vitamina C","fr":"Vitamine C","gl":"Vitamina C","it":"Vitamina C","de":"Vitamin C","pt":"Vitamina C"},{"es":"Vitamina D","en":"Vitamin D","eu":"D bitamina","ca":"Vitamina D","fr":"Vitamine D","gl":"Vitamina D","it":"Vitamina D","de":"Vitamin D","pt":"Vitamina D"}]'::jsonb,
  3, 'body'
),
-- Q122 cinema hard
(
  '{"es":"¿Qué película tiene la frase Que la Fuerza te acompañe?","en":"Which movie has the line May the Force be with you?","eu":"Zein filmek du Indarra zurekin izan dadila esaldia?","ca":"Quina pel·licula te la frase Que la Forca t acompanyi?","fr":"Quel film contient la replique Que la Force soit avec toi?","gl":"Que película ten a frase Que a Forza te acompañe?","it":"Quale film ha la frase Che la Forza sia con te?","de":"In welchem Film kommt der Satz Moege die Macht mit dir sein vor?","pt":"Que filme tem a frase Que a Forca esteja contigo?"}'::jsonb,
  '[{"es":"Star Trek","en":"Star Trek","eu":"Star Trek","ca":"Star Trek","fr":"Star Trek","gl":"Star Trek","it":"Star Trek","de":"Star Trek","pt":"Star Trek"},{"es":"Star Wars","en":"Star Wars","eu":"Star Wars","ca":"Star Wars","fr":"Star Wars","gl":"Star Wars","it":"Star Wars","de":"Star Wars","pt":"Star Wars"},{"es":"Dune","en":"Dune","eu":"Dune","ca":"Dune","fr":"Dune","gl":"Dune","it":"Dune","de":"Dune","pt":"Dune"},{"es":"Avatar","en":"Avatar","eu":"Avatar","ca":"Avatar","fr":"Avatar","gl":"Avatar","it":"Avatar","de":"Avatar","pt":"Avatar"}]'::jsonb,
  1, 'cinema'
),
-- Q123 technology hard
(
  '{"es":"¿En qué año se fundó Google?","en":"In what year was Google founded?","eu":"Zein urtetan sortu zen Google?","ca":"En quin any es va fundar Google?","fr":"En quelle annee Google a-t-il ete fonde?","gl":"En que ano se fundou Google?","it":"In che anno e stata fondata Google?","de":"In welchem Jahr wurde Google gegruendet?","pt":"Em que ano foi fundado o Google?"}'::jsonb,
  '[{"es":"1994","en":"1994","eu":"1994","ca":"1994","fr":"1994","gl":"1994","it":"1994","de":"1994","pt":"1994"},{"es":"1996","en":"1996","eu":"1996","ca":"1996","fr":"1996","gl":"1996","it":"1996","de":"1996","pt":"1996"},{"es":"1998","en":"1998","eu":"1998","ca":"1998","fr":"1998","gl":"1998","it":"1998","de":"1998","pt":"1998"},{"es":"2000","en":"2000","eu":"2000","ca":"2000","fr":"2000","gl":"2000","it":"2000","de":"2000","pt":"2000"}]'::jsonb,
  2, 'technology'
),
-- Q124 literature hard
(
  '{"es":"¿En qué idioma escribió Franz Kafka?","en":"In what language did Franz Kafka write?","eu":"Zein hizkuntzatan idatzi zuen Franz Kafkak?","ca":"En quin idioma va escriure Franz Kafka?","fr":"Dans quelle langue Franz Kafka ecrivait-il?","gl":"En que idioma escribiu Franz Kafka?","it":"In che lingua scriveva Franz Kafka?","de":"In welcher Sprache schrieb Franz Kafka?","pt":"Em que idioma escreveu Franz Kafka?"}'::jsonb,
  '[{"es":"Checo","en":"Czech","eu":"Txekera","ca":"Txec","fr":"Tcheque","gl":"Checo","it":"Ceco","de":"Tschechisch","pt":"Checo"},{"es":"Alemán","en":"German","eu":"Alemanera","ca":"Alemany","fr":"Allemand","gl":"Aleman","it":"Tedesco","de":"Deutsch","pt":"Alemao"},{"es":"Hungaro","en":"Hungarian","eu":"Hungariera","ca":"Hongares","fr":"Hongrois","gl":"Hungaro","it":"Ungherese","de":"Ungarisch","pt":"Hungaro"},{"es":"Polaco","en":"Polish","eu":"Poloniera","ca":"Polones","fr":"Polonais","gl":"Polaco","it":"Polacco","de":"Polnisch","pt":"Polaco"}]'::jsonb,
  1, 'literature'
),
-- Q125 science hard
(
  '{"es":"¿Cuántos elementos tiene la tabla periódica actualmente?","en":"How many elements does the periodic table currently have?","eu":"Zenbat elementu ditu taula periodikoak gaur egun?","ca":"Quants elements te la taula periódica actualment?","fr":"Combien d elements le tableau periodique compte-t-il actuellement?","gl":"Cantos elementos ten a taboa periódica actualmente?","it":"Quanti elementi ha attualmente la tavola periódica?","de":"Wie viele Elemente hat das Periodensystem derzeit?","pt":"Quantos elementos tem a tabela periódica atualmente?"}'::jsonb,
  '[{"es":"108","en":"108","eu":"108","ca":"108","fr":"108","gl":"108","it":"108","de":"108","pt":"108"},{"es":"112","en":"112","eu":"112","ca":"112","fr":"112","gl":"112","it":"112","de":"112","pt":"112"},{"es":"118","en":"118","eu":"118","ca":"118","fr":"118","gl":"118","it":"118","de":"118","pt":"118"},{"es":"126","en":"126","eu":"126","ca":"126","fr":"126","gl":"126","it":"126","de":"126","pt":"126"}]'::jsonb,
  2, 'science'
),
-- Q126 geography hard
(
  '{"es":"¿Cuál es el volcán más alto del mundo?","en":"What is the tallest volcáno in the world?","eu":"Zein da munduko sumendirik altuena?","ca":"Quin es el volca mes alt del mon?","fr":"Quel est le volcán le plus haut du monde?","gl":"Cal e o volcán mais alto do mundo?","it":"Qual e il vulcano piu alto del mondo?","de":"Welcher ist der hoechste Vulkan der Welt?","pt":"Qual e o vulcao mais alto do mundo?"}'::jsonb,
  '[{"es":"Monte Fuji","en":"Mount Fuji","eu":"Fuji mendia","ca":"Mont Fuji","fr":"Mont Fuji","gl":"Monte Fuxi","it":"Monte Fuji","de":"Fuji","pt":"Monte Fuji"},{"es":"Ojos del Salado","en":"Ojos del Salado","eu":"Ojos del Salado","ca":"Ojos del Salado","fr":"Ojos del Salado","gl":"Ojos del Salado","it":"Ojos del Salado","de":"Ojos del Salado","pt":"Ojos del Salado"},{"es":"Kilimanjaro","en":"Kilimanjaro","eu":"Kilimanjaro","ca":"Kilimanjaro","fr":"Kilimandjaro","gl":"Quilimanjaro","it":"Kilimangiaro","de":"Kilimandscharo","pt":"Quilimanjaro"},{"es":"Etna","en":"Etna","eu":"Etna","ca":"Etna","fr":"Etna","gl":"Etna","it":"Etna","de":"Aetna","pt":"Etna"}]'::jsonb,
  1, 'geography'
),
-- Q127 history hard
(
  '{"es":"¿Qué imperio construyó el Coliseo de Roma?","en":"Which empire built the Colosseum in Rome?","eu":"Zein inperiok eraiki zuen Erromako Koloseoa?","ca":"Quin imperi va construir el Colosseu de Roma?","fr":"Quel empire a construit le Colisee de Rome?","gl":"Que imperio construiu o Coliseo de Roma?","it":"Quale impero ha costruito il Colosseo di Roma?","de":"Welches Reich hat das Kolosseum in Rom erbaut?","pt":"Que imperio construiu o Coliseu de Roma?"}'::jsonb,
  '[{"es":"Imperio Griego","en":"Greek Empire","eu":"Inperio Greziarra","ca":"Imperi Grec","fr":"Empire Grec","gl":"Imperio Grego","it":"Impero Greco","de":"Griechisches Reich","pt":"Imperio Grego"},{"es":"Imperio Romano","en":"Roman Empire","eu":"Erromatar Inperioa","ca":"Imperi Roma","fr":"Empire Romain","gl":"Imperio Romano","it":"Impero Romano","de":"Roemisches Reich","pt":"Imperio Romano"},{"es":"Imperio Otomano","en":"Ottoman Empire","eu":"Otomandar Inperioa","ca":"Imperi Otoma","fr":"Empire Ottoman","gl":"Imperio Otomano","it":"Impero Ottomano","de":"Osmanisches Reich","pt":"Imperio Otomano"},{"es":"Imperio Persa","en":"Persian Empire","eu":"Pertsiar Inperioa","ca":"Imperi Persa","fr":"Empire Perse","gl":"Imperio Persa","it":"Impero Persiano","de":"Persisches Reich","pt":"Imperio Persa"}]'::jsonb,
  1, 'history'
),
-- Q128 space hard
(
  '{"es":"¿Qué es un agujero negro?","en":"What is a black hole?","eu":"Zer da zulo beltz bat?","ca":"Que es un forat negre?","fr":"Qu est-ce qu un trou noir?","gl":"Que e un burato negro?","it":"Cos e un buco nero?","de":"Was ist ein schwarzes Loch?","pt":"O que e um buraco negro?"}'::jsonb,
  '[{"es":"Una estrella muerta","en":"A dead star","eu":"Izar hil bat","ca":"Una estrella morta","fr":"Une etoile morte","gl":"Unha estrela morta","it":"Una stella morta","de":"Ein toter Stern","pt":"Uma estrela morta"},{"es":"Una region del espacio con gravedad extrema","en":"A region of space with extreme gravity","eu":"Grabitate muturrekoa duen espazio-eskualde bat","ca":"Una regio de l espai amb gravetat extrema","fr":"Une region de l espace a gravite extreme","gl":"Unha rexion do espazo con gravidade extrema","it":"Una regione dello spazio con gravita estrema","de":"Ein Bereich im Weltraum mit extremer Schwerkraft","pt":"Uma regiao do espaco com gravidade extrema"},{"es":"Un planeta sin luz","en":"A planet without light","eu":"Argirik gabeko planeta bat","ca":"Un planeta sense llum","fr":"Une planete sans lumiere","gl":"Un planeta sen luz","it":"Un pianeta senza luce","de":"Ein Planet ohne Licht","pt":"Um planeta sem luz"},{"es":"Una nube de gas","en":"A gas cloud","eu":"Gas-hodei bat","ca":"Un nuvol de gas","fr":"Un nuage de gaz","gl":"Unha nube de gas","it":"Una nuvola di gas","de":"Eine Gaswolke","pt":"Uma nuvem de gas"}]'::jsonb,
  1, 'space'
),
-- Q129 animals hard
(
  '{"es":"¿Qué animal puede regenerar sus extremidades?","en":"Which animal can regenerate its limbs?","eu":"Zein animaliak birsortzen ditu bere gorputz-adarrak?","ca":"Quin animal pot regenerar les seves extremitats?","fr":"Quel animal peut regenerer ses membres?","gl":"Que animal pode rexenerar as suas extremidades?","it":"Quale animale puo rigenerare i suoi arti?","de":"Welches Tier kann seine Gliedmassen regenerieren?","pt":"Que animal pode regenerar os seus membros?"}'::jsonb,
  '[{"es":"Lagartija","en":"Lizard","eu":"Sugandila","ca":"Llangardaix","fr":"Lezard","gl":"Lagarto","it":"Lucertola","de":"Eidechse","pt":"Lagarto"},{"es":"Salamandra","en":"Salamander","eu":"Salamandra","ca":"Salamandra","fr":"Salamandre","gl":"Salamandra","it":"Salamandra","de":"Salamander","pt":"Salamandra"},{"es":"Axolote","en":"Axolotl","eu":"Axolotea","ca":"Axolot","fr":"Axolotl","gl":"Axolote","it":"Axolotl","de":"Axolotl","pt":"Axolote"},{"es":"Pulpo","en":"Octopus","eu":"Olagarro","ca":"Pop","fr":"Pieuvre","gl":"Polbo","it":"Polpo","de":"Oktopus","pt":"Polvo"}]'::jsonb,
  2, 'animals'
),
-- Q130 food hard
(
  '{"es":"¿Qué fruta es conocida como la reina de las frutas?","en":"Which fruit is known as the queen of fruits?","eu":"Zein fruta da fruten erregina bezala ezagutzen dena?","ca":"Quina fruita es coneguda com la reina de les fruites?","fr":"Quel fruit est connu comme la reine des fruits?","gl":"Que froita e conecida como a raíña das froitas?","it":"Quale frutto e conosciuto come la regina dei frutti?","de":"Welche Frucht ist als Koenigin der Fruechte bekannt?","pt":"Que fruta e conhecida como a rainha das frutas?"}'::jsonb,
  '[{"es":"Mango","en":"Mango","eu":"Mangoa","ca":"Mango","fr":"Mangue","gl":"Manga","it":"Mango","de":"Mango","pt":"Manga"},{"es":"Fresa","en":"Strawberry","eu":"Marrubia","ca":"Maduixa","fr":"Fraise","gl":"Amorodo","it":"Fragola","de":"Erdbeere","pt":"Morango"},{"es":"Mangostino","en":"Mangosteen","eu":"Mangostina","ca":"Mangostí","fr":"Mangoustan","gl":"Mangostino","it":"Mangostano","de":"Mangostan","pt":"Mangostao"},{"es":"Papaya","en":"Papaya","eu":"Papaia","ca":"Papaia","fr":"Papaye","gl":"Papaia","it":"Papaya","de":"Papaya","pt":"Papaia"}]'::jsonb,
  2, 'food'
),
-- Q131 body hard
(
  '{"es":"¿Cuántos litros de aire respira una persona al día aproximadamente?","en":"How many liters of air does a person breathe per day approximately?","eu":"Zenbat litro aire arnastzen ditu pertsona batek egunean gutxi gorabehera?","ca":"Quants litres d aire respira una persona al dia aproximadament?","fr":"Combien de litres d air une personne respire-t-elle par jour environ?","gl":"Cantos litros de aire respira unha persoa ao dia aproximadamente?","it":"Quanti litri d aria respira una persona al giorno approssimativamente?","de":"Wie viele Liter Luft atmet ein Mensch pro Tag ungefaehr?","pt":"Quantos litros de ar respira uma pessoa por dia aproximadamente?"}'::jsonb,
  '[{"es":"5 000","en":"5 000","eu":"5 000","ca":"5 000","fr":"5 000","gl":"5 000","it":"5 000","de":"5 000","pt":"5 000"},{"es":"11 000","en":"11 000","eu":"11 000","ca":"11 000","fr":"11 000","gl":"11 000","it":"11 000","de":"11 000","pt":"11 000"},{"es":"20 000","en":"20 000","eu":"20 000","ca":"20 000","fr":"20 000","gl":"20 000","it":"20 000","de":"20 000","pt":"20 000"},{"es":"50 000","en":"50 000","eu":"50 000","ca":"50 000","fr":"50 000","gl":"50 000","it":"50 000","de":"50 000","pt":"50 000"}]'::jsonb,
  1, 'body'
),
-- Q132 cinema hard
(
  '{"es":"¿Qué actor interpretó al Joker en El Caballero Oscuro?","en":"Which actor played the Joker in The Dark Knight?","eu":"Zein aktorek antzeztu zuen Joker-a Gau Zalduna filmean?","ca":"Quin actor va interpretar el Joker a El Cavaller Fosc?","fr":"Quel acteur a joue le Joker dans The Dark Knight?","gl":"Que actor interpretou ao Joker en O Cabaleiro Escuro?","it":"Quale attore ha interpretato il Joker in Il cavaliere oscuro?","de":"Welcher Schauspieler spielte den Joker in The Dark Knight?","pt":"Que ator interpretou o Joker em O Cavaleiro das Trevas?"}'::jsonb,
  '[{"es":"Jack Nicholson","en":"Jack Nicholson","eu":"Jack Nicholson","ca":"Jack Nicholson","fr":"Jack Nicholson","gl":"Jack Nicholson","it":"Jack Nicholson","de":"Jack Nicholson","pt":"Jack Nicholson"},{"es":"Joaquin Phoenix","en":"Joaquin Phoenix","eu":"Joaquin Phoenix","ca":"Joaquin Phoenix","fr":"Joaquin Phoenix","gl":"Joaquin Phoenix","it":"Joaquin Phoenix","de":"Joaquin Phoenix","pt":"Joaquin Phoenix"},{"es":"Heath Ledger","en":"Heath Ledger","eu":"Heath Ledger","ca":"Heath Ledger","fr":"Heath Ledger","gl":"Heath Ledger","it":"Heath Ledger","de":"Heath Ledger","pt":"Heath Ledger"},{"es":"Jared Leto","en":"Jared Leto","eu":"Jared Leto","ca":"Jared Leto","fr":"Jared Leto","gl":"Jared Leto","it":"Jared Leto","de":"Jared Leto","pt":"Jared Leto"}]'::jsonb,
  2, 'cinema'
),
-- Q133 sports hard
(
  '{"es":"¿En qué deporte se utiliza un disco llamado puck?","en":"In which sport is a disc called a puck used?","eu":"Zein kiroletan erabiltzen da puck izeneko diskoa?","ca":"En quin esport s utilitza un disc anomenat puck?","fr":"Dans quel sport utilise-t-on un disque appele palet?","gl":"En que deporte se utiliza un disco chamado puck?","it":"In quale sport si usa un disco chiamato puck?","de":"In welcher Sportart wird eine Scheibe namens Puck verwendet?","pt":"Em que desporto se utiliza um disco chamado puck?"}'::jsonb,
  '[{"es":"Hockey sobre hielo","en":"Ice hockey","eu":"Izotz gaineko hockeya","ca":"Hoquei sobre gel","fr":"Hockey sur glace","gl":"Hóckey sobre xeo","it":"Hockey su ghiaccio","de":"Eishockey","pt":"Hoquei no gelo"},{"es":"Hockey sobre hierba","en":"Field hockey","eu":"Belar gaineko hockeya","ca":"Hoquei sobre herba","fr":"Hockey sur gazon","gl":"Hóckey sobre herba","it":"Hockey su prato","de":"Feldhockey","pt":"Hoquei em campo"},{"es":"Curling","en":"Curling","eu":"Curling","ca":"Curling","fr":"Curling","gl":"Curling","it":"Curling","de":"Curling","pt":"Curling"},{"es":"Lacrosse","en":"Lacrosse","eu":"Lacrosse","ca":"Lacrosse","fr":"Crosse","gl":"Lacrosse","it":"Lacrosse","de":"Lacrosse","pt":"Lacrosse"}]'::jsonb,
  0, 'sports'
),
-- Q134 music hard
(
  '{"es":"¿Qué género musical nació en Nueva Orleans?","en":"What music genre was born in New Orleans?","eu":"Zein musika genero jaio zen New Orleanskoan?","ca":"Quin genere musical va neixer a Nova Orleans?","fr":"Quel genre musical est ne a La Nouvelle-Orleans?","gl":"Que xenero musical naceu en Nova Orleans?","it":"Quale genere musicale e nato a New Orleans?","de":"Welches Musikgenre entstand in New Orleans?","pt":"Que género musical nasceu em Nova Orleans?"}'::jsonb,
  '[{"es":"Blues","en":"Blues","eu":"Blues","ca":"Blues","fr":"Blues","gl":"Blues","it":"Blues","de":"Blues","pt":"Blues"},{"es":"Jazz","en":"Jazz","eu":"Jazz","ca":"Jazz","fr":"Jazz","gl":"Jazz","it":"Jazz","de":"Jazz","pt":"Jazz"},{"es":"Rock","en":"Rock","eu":"Rock","ca":"Rock","fr":"Rock","gl":"Rock","it":"Rock","de":"Rock","pt":"Rock"},{"es":"Soul","en":"Soul","eu":"Soul","ca":"Soul","fr":"Soul","gl":"Soul","it":"Soul","de":"Soul","pt":"Soul"}]'::jsonb,
  1, 'music'
),
-- Q135 nature hard
(
  '{"es":"¿Cuánto tarda la luz del Sol en llegar a la Tierra?","en":"How long does it take sunlight to reach Earth?","eu":"Zenbat denbora behar du Eguzkiaren argiak Lurrera iristeko?","ca":"Quant tarda la llum del Sol a arribar a la Terra?","fr":"Combien de temps met la lumiere du Soleil pour atteindre la Terre?","gl":"Canto tarda a luz do Sol en chegar a Terra?","it":"Quanto tempo impiega la luce del Sole a raggiungere la Terra?","de":"Wie lange braucht das Sonnenlicht um die Erde zu erreichen?","pt":"Quanto tempo demora a luz do Sol a chegar a Terra?"}'::jsonb,
  '[{"es":"30 segundos","en":"30 seconds","eu":"30 segundo","ca":"30 segons","fr":"30 secondes","gl":"30 segundos","it":"30 secondi","de":"30 Sekunden","pt":"30 segundos"},{"es":"4 minutos","en":"4 minutes","eu":"4 minutu","ca":"4 minuts","fr":"4 minutes","gl":"4 minutos","it":"4 minuti","de":"4 Minuten","pt":"4 minutos"},{"es":"8 minutos","en":"8 minutes","eu":"8 minutu","ca":"8 minuts","fr":"8 minutes","gl":"8 minutos","it":"8 minuti","de":"8 Minuten","pt":"8 minutos"},{"es":"15 minutos","en":"15 minutes","eu":"15 minutu","ca":"15 minuts","fr":"15 minutes","gl":"15 minutos","it":"15 minuti","de":"15 Minuten","pt":"15 minutos"}]'::jsonb,
  2, 'nature'
),
-- Q136 technology hard
(
  '{"es":"¿Qué significa CPU?","en":"What does CPU stand for?","eu":"Zer esan nahi du CPU siglak?","ca":"Que significa CPU?","fr":"Que signifie CPU?","gl":"Que significa CPU?","it":"Cosa significa CPU?","de":"Wofuer steht CPU?","pt":"O que significa CPU?"}'::jsonb,
  '[{"es":"Central Processing Unit","en":"Central Processing Unit","eu":"Central Processing Unit","ca":"Central Processing Unit","fr":"Central Processing Unit","gl":"Central Processing Unit","it":"Central Processing Unit","de":"Central Processing Unit","pt":"Central Processing Unit"},{"es":"Computer Personal Unit","en":"Computer Personal Unit","eu":"Computer Personal Unit","ca":"Computer Personal Unit","fr":"Computer Personal Unit","gl":"Computer Personal Unit","it":"Computer Personal Unit","de":"Computer Personal Unit","pt":"Computer Personal Unit"},{"es":"Central Program Utility","en":"Central Program Utility","eu":"Central Program Utility","ca":"Central Program Utility","fr":"Central Program Utility","gl":"Central Program Utility","it":"Central Program Utility","de":"Central Program Utility","pt":"Central Program Utility"},{"es":"Core Processing Utility","en":"Core Processing Utility","eu":"Core Processing Utility","ca":"Core Processing Utility","fr":"Core Processing Utility","gl":"Core Processing Utility","it":"Core Processing Utility","de":"Core Processing Utility","pt":"Core Processing Utility"}]'::jsonb,
  0, 'technology'
),
-- Q137 literature hard
(
  '{"es":"¿Quién escribió Crimen y Castigo?","en":"Who wrote Crime and Punishment?","eu":"Nork idatzi zuen Krimena eta Zigorra?","ca":"Qui va escriure Crim i Castig?","fr":"Qui a ecrit Crime et Chatiment?","gl":"Quen escribiu Crime e Castigo?","it":"Chi ha scritto Delitto e castigo?","de":"Wer schrieb Schuld und Suehne?","pt":"Quem escreveu Crime e Castigo?"}'::jsonb,
  '[{"es":"León Tolstoi","en":"Leo Tolstoy","eu":"Leon Tolstoi","ca":"Lleó Tolstoi","fr":"Leon Tolstoi","gl":"Leon Tolstoi","it":"Lev Tolstoj","de":"Leo Tolstoi","pt":"Leao Tolstoi"},{"es":"Fiodor Dostoievski","en":"Fyodor Dostoevsky","eu":"Fiodor Dostoievski","ca":"Fiodor Dostoievski","fr":"Fiodor Dostoievski","gl":"Fiodor Dostoievski","it":"Fedor Dostoevskij","de":"Fjodor Dostojewski","pt":"Fiodor Dostoievski"},{"es":"Anton Chejov","en":"Anton Chekhov","eu":"Anton Txekhov","ca":"Anton Txekhov","fr":"Anton Tchekhov","gl":"Anton Chekhov","it":"Anton Cechov","de":"Anton Tschechow","pt":"Anton Chekhov"},{"es":"Nikolai Gogol","en":"Nikolai Gogol","eu":"Nikolai Gogol","ca":"Nikolai Gògol","fr":"Nicolas Gogol","gl":"Nikolai Gogol","it":"Nikolaj Gogol","de":"Nikolai Gogol","pt":"Nikolai Gogol"}]'::jsonb,
  1, 'literature'
),
-- Q138 art hard
(
  '{"es":"¿Qué técnica usa puntos pequeños para crear imágenes?","en":"What technique uses small dots to create images?","eu":"Zein teknikak erabiltzen ditu puntu txikiak irudiak sortzeko?","ca":"Quina técnica utilitza punts petits per crear imatges?","fr":"Quelle technique utilise de petits points pour creer des images?","gl":"Que tecnica usa puntos pequenos para crear imaxes?","it":"Quale tecnica usa piccoli punti per creare immagini?","de":"Welche Technik verwendet kleine Punkte um Bilder zu erzeugen?","pt":"Que tecnica usa pontos pequenos para criar imagens?"}'::jsonb,
  '[{"es":"Impresionismo","en":"Impressionism","eu":"Inpresionismoa","ca":"Impressionisme","fr":"Impressionnisme","gl":"Impresionismo","it":"Impressionismo","de":"Impressionismus","pt":"Impressionismo"},{"es":"Puntillismo","en":"Pointillism","eu":"Puntillismoa","ca":"Puntillisme","fr":"Pointillisme","gl":"Puntillismo","it":"Puntinismo","de":"Pointillismus","pt":"Pontilhismo"},{"es":"Cubismo","en":"Cubism","eu":"Kubismoa","ca":"Cubisme","fr":"Cubisme","gl":"Cubismo","it":"Cubismo","de":"Kubismus","pt":"Cubismo"},{"es":"Fauvismo","en":"Fauvism","eu":"Fauvismoa","ca":"Fauvisme","fr":"Fauvisme","gl":"Fauvismo","it":"Fauvismo","de":"Fauvismus","pt":"Fauvismo"}]'::jsonb,
  1, 'art'
),
-- Q139 geography hard
(
  '{"es":"¿Cuántos husos horarios tiene Rusia?","en":"How many time zones does Russia have?","eu":"Zenbat ordu-eremu ditu Errusiak?","ca":"Quants fusos horaris te Russia?","fr":"Combien de fuseaux horaires la Russie possede-t-elle?","gl":"Cantos fusos horarios ten Rusia?","it":"Quanti fusi orari ha la Russia?","de":"Wie viele Zeitzonen hat Russland?","pt":"Quantos fusos horarios tem a Russia?"}'::jsonb,
  '[{"es":"7","en":"7","eu":"7","ca":"7","fr":"7","gl":"7","it":"7","de":"7","pt":"7"},{"es":"9","en":"9","eu":"9","ca":"9","fr":"9","gl":"9","it":"9","de":"9","pt":"9"},{"es":"11","en":"11","eu":"11","ca":"11","fr":"11","gl":"11","it":"11","de":"11","pt":"11"},{"es":"13","en":"13","eu":"13","ca":"13","fr":"13","gl":"13","it":"13","de":"13","pt":"13"}]'::jsonb,
  2, 'geography'
),
-- Q140 science hard
(
  '{"es":"¿Cuál es la fórmula química de la sal común?","en":"What is the chemical fórmula for common salt?","eu":"Zein da gatz arrunten fórmula kimikoa?","ca":"Quina es la fórmula química de la sal comuna?","fr":"Quelle est la formule chimique du sel commun?","gl":"Cal e a fórmula química do sal comun?","it":"Qual e la fórmula chimica del sale comune?","de":"Was ist die chemische Formel fuer Kochsalz?","pt":"Qual e a fórmula química do sal comum?"}'::jsonb,
  '[{"es":"NaCl","en":"NaCl","eu":"NaCl","ca":"NaCl","fr":"NaCl","gl":"NaCl","it":"NaCl","de":"NaCl","pt":"NaCl"},{"es":"KCl","en":"KCl","eu":"KCl","ca":"KCl","fr":"KCl","gl":"KCl","it":"KCl","de":"KCl","pt":"KCl"},{"es":"CaCl2","en":"CaCl2","eu":"CaCl2","ca":"CaCl2","fr":"CaCl2","gl":"CaCl2","it":"CaCl2","de":"CaCl2","pt":"CaCl2"},{"es":"NaOH","en":"NaOH","eu":"NaOH","ca":"NaOH","fr":"NaOH","gl":"NaOH","it":"NaOH","de":"NaOH","pt":"NaOH"}]'::jsonb,
  0, 'science'
),
-- Q141 history hard
(
  '{"es":"¿Qué país lanzó las bombas atómicas en 1945?","en":"Which country dropped the atomic bombs in 1945?","eu":"Zein herrialdelk jaurti zituen bonba atomikoak 1945ean?","ca":"Quin paísva llancar les bombes atomiques el 1945?","fr":"Quel pays a largue les bombes atomiques en 1945?","gl":"Que paíslanzou as bombas atómicas en 1945?","it":"Quale paese ha sganciato le bombe atomiche nel 1945?","de":"Welches Land warf 1945 die Atombomben ab?","pt":"Que paíslancou as bombas atómicas em 1945?"}'::jsonb,
  '[{"es":"Reino Unido","en":"United Kingdom","eu":"Erresuma Batua","ca":"Regne Unit","fr":"Royaume-Uni","gl":"Reino Unido","it":"Regno Unito","de":"Vereinigtes Koenigreich","pt":"Reino Unido"},{"es":"Estados Unidos","en":"United States","eu":"Amerikako Estatu Batuak","ca":"Estats Units","fr":"Etats-Unis","gl":"Estados Unidos","it":"Stati Uniti","de":"Vereinigte Staaten","pt":"Estados Unidos"},{"es":"Union Sovietica","en":"Soviet Union","eu":"Sobietar Batasuna","ca":"Unio Sovietica","fr":"Union sovietique","gl":"Union Sovietica","it":"Unione Sovietica","de":"Sowjetunion","pt":"Uniao Sovietica"},{"es":"Alemania","en":"Germany","eu":"Alemania","ca":"Alemanya","fr":"Allemagne","gl":"Alemaña","it":"Germania","de":"Deutschland","pt":"Alemanha"}]'::jsonb,
  1, 'history'
),
-- Q142 space hard
(
  '{"es":"¿Cuántas lunas tiene Marte?","en":"How many moons does Mars have?","eu":"Zenbat ilargi ditu Martek?","ca":"Quantes llunes te Mart?","fr":"Combien de lunes Mars possede-t-il?","gl":"Cantas luas ten Marte?","it":"Quante lune ha Marte?","de":"Wie viele Monde hat der Mars?","pt":"Quantas luas tem Marte?"}'::jsonb,
  '[{"es":"0","en":"0","eu":"0","ca":"0","fr":"0","gl":"0","it":"0","de":"0","pt":"0"},{"es":"1","en":"1","eu":"1","ca":"1","fr":"1","gl":"1","it":"1","de":"1","pt":"1"},{"es":"2","en":"2","eu":"2","ca":"2","fr":"2","gl":"2","it":"2","de":"2","pt":"2"},{"es":"4","en":"4","eu":"4","ca":"4","fr":"4","gl":"4","it":"4","de":"4","pt":"4"}]'::jsonb,
  2, 'space'
),
-- Q143 animals hard
(
  '{"es":"¿Qué animal tiene el cerebro más grande?","en":"Which animal has the largest brain?","eu":"Zein animaliak du garunik handiena?","ca":"Quin animal te el cervell mes gran?","fr":"Quel animal a le plus gros cerveau?","gl":"Que animal ten o cerebro mais grande?","it":"Quale animale ha il cervello piu grande?","de":"Welches Tier hat das groesste Gehirn?","pt":"Que animal tem o maior cerebro?"}'::jsonb,
  '[{"es":"Elefante","en":"Elephant","eu":"Elefantea","ca":"Elefant","fr":"Elephant","gl":"Elefante","it":"Elefante","de":"Elefant","pt":"Elefante"},{"es":"Cachalote","en":"Sperm whale","eu":"Kaxalotea","ca":"Catxalot","fr":"Cachalot","gl":"Cachalote","it":"Capodoglio","de":"Pottwal","pt":"Cachalote"},{"es":"Delfin","en":"Dolphin","eu":"Izurdea","ca":"Dolfi","fr":"Dauphin","gl":"Golfinho","it":"Delfino","de":"Delfin","pt":"Golfinho"},{"es":"Gorila","en":"Gorilla","eu":"Gorila","ca":"Goril·la","fr":"Gorille","gl":"Gorila","it":"Gorilla","de":"Gorilla","pt":"Gorila"}]'::jsonb,
  1, 'animals'
),
-- Q144 food hard
(
  '{"es":"¿Qué tipo de pasta tiene forma de lazo?","en":"What type of pasta is shaped like a bow?","eu":"Zein pasta motak du begizta forma?","ca":"Quin tipus de pasta te forma de llac?","fr":"Quel type de pates a la forme d un noeud?","gl":"Que tipo de pasta ten forma de lazo?","it":"Quale tipo di pasta ha la forma di un fiocco?","de":"Welche Pastasorte hat die Form einer Schleife?","pt":"Que tipo de massa tem forma de laco?"}'::jsonb,
  '[{"es":"Penne","en":"Penne","eu":"Penne","ca":"Penne","fr":"Penne","gl":"Penne","it":"Penne","de":"Penne","pt":"Penne"},{"es":"Farfalle","en":"Farfalle","eu":"Farfalle","ca":"Farfalle","fr":"Farfalle","gl":"Farfalle","it":"Farfalle","de":"Farfalle","pt":"Farfalle"},{"es":"Fusilli","en":"Fusilli","eu":"Fusilli","ca":"Fusilli","fr":"Fusilli","gl":"Fusilli","it":"Fusilli","de":"Fusilli","pt":"Fusilli"},{"es":"Rigatoni","en":"Rigatoni","eu":"Rigatoni","ca":"Rigatoni","fr":"Rigatoni","gl":"Rigatoni","it":"Rigatoni","de":"Rigatoni","pt":"Rigatoni"}]'::jsonb,
  1, 'food'
),
-- Q145 landmarks hard
(
  '{"es":"¿En qué ciudad se encuentra la Estatua de la Libertad?","en":"In which city is the Statue of Liberty located?","eu":"Zein hiritan dago Askatasunaren Estatua?","ca":"A quina ciutat es troba l Estatua de la Llibertat?","fr":"Dans quelle ville se trouve la Statue de la Liberte?","gl":"En que cidade esta a Estatua da Liberdade?","it":"In quale citta si trova la Statua della Liberta?","de":"In welcher Stadt befindet sich die Freiheitsstatue?","pt":"Em que cidade se encontra a Estatua da Liberdade?"}'::jsonb,
  '[{"es":"Washington D.C.","en":"Washington D.C.","eu":"Washington D.C.","ca":"Washington D.C.","fr":"Washington D.C.","gl":"Washington D.C.","it":"Washington D.C.","de":"Washington D.C.","pt":"Washington D.C."},{"es":"Nueva York","en":"New York","eu":"New York","ca":"Nova York","fr":"New York","gl":"Nova York","it":"New York","de":"New York","pt":"Nova Iorque"},{"es":"Boston","en":"Boston","eu":"Boston","ca":"Boston","fr":"Boston","gl":"Boston","it":"Boston","de":"Boston","pt":"Boston"},{"es":"Filadelfia","en":"Philadelphia","eu":"Filadelfia","ca":"Filadelfia","fr":"Philadelphie","gl":"Filadelfia","it":"Filadelfia","de":"Philadelphia","pt":"Filadelfia"}]'::jsonb,
  1, 'landmarks'
),
-- Q146 body hard
(
  '{"es":"¿Qué parte del cerebro controla el equilibrio?","en":"What part of the brain controls balance?","eu":"Garuneko zein atalek kontrolatzen du oreka?","ca":"Quina part del cervell controla l equilibri?","fr":"Quelle partie du cerveau controle l equilibre?","gl":"Que parte do cerebro controla o equilibrio?","it":"Quale parte del cervello controlla l equilibrio?","de":"Welcher Teil des Gehirns kontrolliert das Gleichgewicht?","pt":"Que parte do cerebro controla o equilibrio?"}'::jsonb,
  '[{"es":"Cerebelo","en":"Cerebellum","eu":"Garundioa","ca":"Cerebel","fr":"Cervelet","gl":"Cerebelo","it":"Cervelletto","de":"Kleinhirn","pt":"Cerebelo"},{"es":"Hipotalamo","en":"Hypothalamus","eu":"Hipotalamoa","ca":"Hipotalem","fr":"Hypothalamus","gl":"Hipotalamo","it":"Ipotalamo","de":"Hypothalamus","pt":"Hipotalamo"},{"es":"Corteza cerebral","en":"Cerebral cortex","eu":"Garun-korteza","ca":"Escorca cerebral","fr":"Cortex cerebral","gl":"Corteza cerebral","it":"Corteccia cerebrale","de":"Grosshirnrinde","pt":"Cortex cerebral"},{"es":"Tronco encefalico","en":"Brain stem","eu":"Garun-enborra","ca":"Tronc encefalic","fr":"Tronc cerebral","gl":"Tronco encefalico","it":"Tronco encefalico","de":"Hirnstamm","pt":"Tronco encefalico"}]'::jsonb,
  0, 'body'
),
-- Q147 science hard
(
  '{"es":"¿Cuál es la unidad de medida de la corriente eléctrica?","en":"What is the unit of measurement for electric current?","eu":"Zein da korronte elektrikoaren neurketa-unitatea?","ca":"Quina es la unitat de mesura del corrent electric?","fr":"Quelle est l unite de mesure du courant electrique?","gl":"Cal e a unidade de medida da corrente electrica?","it":"Qual e l unita di misura della corrente elettrica?","de":"Was ist die Masseinheit fuer elektrischen Strom?","pt":"Qual e a unidade de medida da corrente eletrica?"}'::jsonb,
  '[{"es":"Voltio","en":"Volt","eu":"Volt","ca":"Volt","fr":"Volt","gl":"Volt","it":"Volt","de":"Volt","pt":"Volt"},{"es":"Amperio","en":"Ampere","eu":"Ampere","ca":"Ampere","fr":"Ampere","gl":"Amperio","it":"Ampere","de":"Ampere","pt":"Ampere"},{"es":"Vatio","en":"Watt","eu":"Watt","ca":"Watt","fr":"Watt","gl":"Watt","it":"Watt","de":"Watt","pt":"Watt"},{"es":"Ohmio","en":"Ohm","eu":"Ohm","ca":"Ohm","fr":"Ohm","gl":"Ohm","it":"Ohm","de":"Ohm","pt":"Ohm"}]'::jsonb,
  1, 'science'
),
-- Q148 sports hard
(
  '{"es":"¿Cuántas bases tiene un campo de béisbol?","en":"How many bases does a baseball field have?","eu":"Zenbat base ditu beisbol zelai batek?","ca":"Quantes bases te un camp de beisbol?","fr":"Combien de bases un terrain de baseball a-t-il?","gl":"Cantas bases ten un campo de beisbol?","it":"Quante basi ha un campo da baseball?","de":"Wie viele Bases hat ein Baseballfeld?","pt":"Quantas bases tem um campo de beisebol?"}'::jsonb,
  '[{"es":"3","en":"3","eu":"3","ca":"3","fr":"3","gl":"3","it":"3","de":"3","pt":"3"},{"es":"4","en":"4","eu":"4","ca":"4","fr":"4","gl":"4","it":"4","de":"4","pt":"4"},{"es":"5","en":"5","eu":"5","ca":"5","fr":"5","gl":"5","it":"5","de":"5","pt":"5"},{"es":"6","en":"6","eu":"6","ca":"6","fr":"6","gl":"6","it":"6","de":"6","pt":"6"}]'::jsonb,
  1, 'sports'
),
-- Q149 music hard
(
  '{"es":"¿Qué compositor escribió El Mesías?","en":"Which composer wrote Messiah?","eu":"Zein konpositorek idatzi zuen Mesias?","ca":"Quin compositor va escriure El Messies?","fr":"Quel compositeur a ecrit Le Messie?","gl":"Que compositor escribiu O Mesias?","it":"Quale compositore ha scritto Il Messia?","de":"Welcher Komponist schrieb den Messias?","pt":"Que compositor escreveu O Messias?"}'::jsonb,
  '[{"es":"Bach","en":"Bach","eu":"Bach","ca":"Bach","fr":"Bach","gl":"Bach","it":"Bach","de":"Bach","pt":"Bach"},{"es":"Handel","en":"Handel","eu":"Handel","ca":"Handel","fr":"Haendel","gl":"Handel","it":"Haendel","de":"Haendel","pt":"Handel"},{"es":"Haydn","en":"Haydn","eu":"Haydn","ca":"Haydn","fr":"Haydn","gl":"Haydn","it":"Haydn","de":"Haydn","pt":"Haydn"},{"es":"Schubert","en":"Schubert","eu":"Schubert","ca":"Schubert","fr":"Schubert","gl":"Schubert","it":"Schubert","de":"Schubert","pt":"Schubert"}]'::jsonb,
  1, 'music'
),
-- Q150 animals hard
(
  '{"es":"¿Cuál es el insecto más fuerte del mundo en proporción a su peso?","en":"What is the strongest insect in the world relative to its weight?","eu":"Zein da munduko intsekturik indartsuena pisuarekiko?","ca":"Quin es l insecte mes fort del mon en proporcio al seu pes?","fr":"Quel est l insecte le plus fort du monde par rapport a son poids?","gl":"Cal e o insecto mais forte do mundo en proporción ao seu peso?","it":"Qual e l insetto piu forte del mondo in proporzione al suo peso?","de":"Welches ist das staerkste Insekt der Welt im Verhaeltnis zu seinem Gewicht?","pt":"Qual e o inseto mais forte do mundo em proporcao ao seu peso?"}'::jsonb,
  '[{"es":"Hormiga","en":"Ant","eu":"Inurria","ca":"Formiga","fr":"Fourmi","gl":"Formiga","it":"Formica","de":"Ameise","pt":"Formiga"},{"es":"Escarabajo rinoceronte","en":"Rhinoceros beetle","eu":"Errinozeronte kakalardoa","ca":"Escarabat rinoceront","fr":"Scarabee rhinoceros","gl":"Escaravello rinoceronte","it":"Scarabeo rinoceronte","de":"Nashornkaefer","pt":"Escaravelho rinoceronte"},{"es":"Escarabajo pelotero","en":"Dung beetle","eu":"Kakalardo brontzezkoa","ca":"Escarabat piloter","fr":"Bousier","gl":"Escaravello peloteiro","it":"Scarabeo stercorario","de":"Mistkaefer","pt":"Escaravelho rola-bosta"},{"es":"Pulga","en":"Flea","eu":"Arkakusoa","ca":"Puca","fr":"Puce","gl":"Pulga","it":"Pulce","de":"Floh","pt":"Pulga"}]'::jsonb,
  1, 'animals'
);