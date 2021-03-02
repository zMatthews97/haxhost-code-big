const roomName = "🟣 tmvsx ARENA BIG X3 🟣 ";
const botName = "🤴";
const maxPlayers = 16;
const roomPublic = true;
const geo = [{"code": "br", "lat": -23.533773, "lon": -46.625290}];

const room = HBInit({ roomName: roomName, maxPlayers: maxPlayers, public: true, playerName: botName, geo: geo[0] });

const scoreLimit = 3;
const timeLimit = 3;
room.setScoreLimit(scoreLimit);
room.setTimeLimit(timeLimit);
room.setTeamsLock(true);

var adminPassword = 100 + getRandomInt(900);
console.log("adminPassword : " + adminPassword);

/* STADIUM */

const playerRadius = 15;
var ballRadius = 10;
const triggerDistance = playerRadius + ballRadius + 0.01;

/* OPTIONS */

var drawTimeLimit = Infinity;
var maxTeamSize = 4;
var Admin = "Admin | ";
var AdminColor = "0xFFA500"; /*laranja */
var AdminColor2 = "0xFF0000"; /* vermelho */
var AdminColor3 = "0x1288DF"; /* azul */
var AdminColor4 = "0xFF1493"; /* rosa gol contra */

/* PLAYERS */

const Team = { SPECTATORS: 0, RED: 1, BLUE: 2 };
var players;
var teamR;
var teamB;
var teamS;

/* GAME */

var lastTeamTouched;
var lastPlayersTouched;
var goldenGoal = false;
var activePlay = false;
var muteList = [];

/* STATS */

var GKList = new Array(2 * maxPlayers).fill(0);
var Rposs = 0;
var Bposs = 0;
var point = [{"x": 0, "y": 0}, {"x": 0, "y": 0}];
var ballSpeed;
var lastWinner = Team.SPECTATORS;
var streak = 0;

/* AUXILIARY */

var checkTimeVariable = false;

/* FUNCTIONS */

/* AUXILIARY FUNCTIONS */

function getRandomInt(max) { // return random number from 0 to max-1
	return Math.floor(Math.random() * Math.floor(max)); 
}

function arrayMin(arr) {
    var len = arr.length;
    var min = Infinity;
	while (len--) {
		if (arr[len] < min) {
			min = arr[len];
	  	}
	}
	return min;
}

function getTime(scores) {
	return "[" + Math.floor(Math.floor(scores.time/60)/10).toString() + Math.floor(Math.floor(scores.time/60)%10).toString() + ":" + Math.floor(Math.floor(scores.time - (Math.floor(scores.time/60) * 60))/10).toString() + Math.floor(Math.floor(scores.time - (Math.floor(scores.time/60) * 60))%10).toString() + "]"
}

function pointDistance(p1, p2) {
	var d1 = p1.x - p2.x;
	var d2 = p1.y - p2.y;
	return Math.sqrt(d1 * d1 + d2 * d2);
}

/* BUTTONS */

function topBtn() {
	if (teamS.length == 0) {
		return;
	}
	else {
		if (teamR.length == teamB.length) {
			if (teamS.length > 1) {
				room.setPlayerTeam(teamS[0].id, Team.RED);
				room.setPlayerTeam(teamS[1].id, Team.BLUE);
			}
			return;
		}
		else if (teamR.length < teamB.length) {
			room.setPlayerTeam(teamS[0].id, Team.RED);
		}
		else {
			room.setPlayerTeam(teamS[0].id, Team.BLUE);
		}
	}
}

function resetBtn() {
	resettingTeams = true;
	setTimeout(function() { resettingTeams = false; }, 100);
	if (teamR.length <= teamB.length) {
		for (var i = 0; i < teamR.length; i++) {
			room.setPlayerTeam(teamB[teamB.length - 1 - i].id, Team.SPECTATORS);
			room.setPlayerTeam(teamR[teamR.length - 1 - i].id, Team.SPECTATORS);
		}
		for (var i = teamR.length; i < teamB.length; i++) {
			room.setPlayerTeam(teamB[teamB.length - 1 - i].id, Team.SPECTATORS);
		}
	}
	else {
		for (var i = 0; i < teamB.length; i++) {
			room.setPlayerTeam(teamB[teamB.length - 1 - i].id, Team.SPECTATORS);
			room.setPlayerTeam(teamR[teamR.length - 1 - i].id, Team.SPECTATORS);
		}
		for (var i = teamB.length; i < teamR.length; i++) {
			room.setPlayerTeam(teamR[teamR.length - 1 - i].id, Team.SPECTATORS);
		}
	}
}

function blueToSpecBtn() {
	resettingTeams = true;
	setTimeout(function() { resettingTeams = false; }, 100);
	for (var i = 0; i < teamB.length; i++) {
		room.setPlayerTeam(teamB[teamB.length - 1 - i].id, Team.SPECTATORS);
	}
}

function redToSpecBtn() {
	resettingTeams = true;
	setTimeout(function() { resettingTeams = false; }, 100);
	for (var i = 0; i < teamR.length; i++) {
		room.setPlayerTeam(teamR[teamR.length - 1 - i].id, Team.SPECTATORS);
	}
}

function blueToRedBtn() {
	resettingTeams = true;
	setTimeout(() => { resettingTeams = false; }, 100);
	for (var i = 0; i < teamB.length; i++) {
		room.setPlayerTeam(teamB[i].id, Team.RED);
	}
}

/* GAME FUNCTIONS */
function checkTime() {
	const scores = room.getScores();
	if (Math.abs(scores.time - scores.timeLimit) <= 0.01 && scores.timeLimit != 0) {
		if (scores.red != scores.blue) {
			if (checkTimeVariable == false) {
				checkTimeVariable = true;
				setTimeout(() => { checkTimeVariable = false; }, 3000);
				scores.red > scores.blue ? endGame(Team.RED) : endGame(Team.BLUE);
				setTimeout(() => { room.stopGame(); }, 2000);
			}
			return;
		}
		goldenGoal = true;
		room.sendAnnouncement("⚽ O primeiro a marcar vence ! ⚽", undefined, AdminColor2, "bold")
	}
	if (Math.abs(drawTimeLimit * 60 - scores.time - 60) <= 0.01 && players.length > 2) {
		if (checkTimeVariable == false) {
			checkTimeVariable = true;
			setTimeout(() => { checkTimeVariable = false; }, 10);
			room.sendChat("⌛ 60 seconds left until draw! ⌛");
		}
	}
	if (Math.abs(scores.time - drawTimeLimit * 60) <= 0.01 && players.length > 2) {
		if (checkTimeVariable == false) {
			checkTimeVariable = true;
			setTimeout(() => { checkTimeVariable = false; }, 10);
			endGame(Team.SPECTATORS);
			room.stopGame();
			goldenGoal = false;
		}
	}
}

function endGame(winner) { // no stopGame() function in it
	const scores = room.getScores();
	Rposs = Rposs/(Rposs+Bposs);
	Bposs = 1 - Rposs;
	lastWinner = winner;
	if (winner == Team.RED) {
		streak++;
		room.sendAnnouncement("🔴 Time vermelho venceu " + scores.red + "-" + scores.blue + " ! Current streak : " + streak + " 🏆", undefined, AdminColor2, "bold");
		room.sendAnnouncement("⭐ Posse de bola : 🔴 " + (Rposs*100).toPrecision(3).toString() + "% : " + (Bposs*100).toPrecision(3).toString() + "% 🔵", undefined, AdminColor2, "bold");
		if (scores.blue == 0) {
			room.sendAnnouncement("🏆 " + teamR[GKList.slice(0, maxPlayers).findIndex(p => p == Math.max(...GKList.slice(0, maxPlayers)))].name + " Não sofreu gol ! ", undefined, AdminColor2, "bold");
		}
	}
	else if (winner == Team.BLUE) {
		streak = 1;
		room.sendAnnouncement("🔵 Time azul venceu " + scores.blue + "-" + scores.red + " ! Sequência atual : " + streak + " 🏆", undefined, AdminColor3, "bold");
		room.sendAnnouncement("⭐ Posse de bola : 🔴 " + (Rposs*100).toPrecision(3).toString() + "% : " + (Bposs*100).toPrecision(3).toString() + "% 🔵", undefined, AdminColor3, "bold");
		if (scores.red == 0) {
			room.sendAnnouncement("🏆 " + teamB[GKList.slice(maxPlayers, 2 * maxPlayers).findIndex(p => p == Math.max(...GKList.slice(maxPlayers, 2 * maxPlayers)))].name + " Não sofreu gol ! ", undefined, AdminColor3, "bold");
		}
	}
}



/* PLAYER FUNCTIONS */

function updateTeams() {
	players = room.getPlayerList().filter((player) => player.id != 0);
	teamR = players.filter(p => p.team === Team.RED);
	teamB = players.filter(p => p.team === Team.BLUE);
	teamS = players.filter(p => p.team === Team.SPECTATORS);
}


function updateList(number, team) {
	if (room.getScores() != null) {
		if (team == Team.RED) {
			GKList = GKList.slice(0, number).concat(GKList.slice(number + 1, maxPlayers)).concat(0).concat(GKList.slice(maxPlayers, GKList.length));
			
		}
		else if (team == Team.BLUE) {
			GKList = GKList.slice(0, maxPlayers + number).concat(GKList.slice(maxPlayers + number + 1, GKList.length).concat(0));
		}
	}
}

/* STATS FUNCTIONS */

function getLastTouchOfTheBall() {
	const ballPosition = room.getBallPosition();
	updateTeams();
	for (var i = 0; i < players.length; i++) {
		if (players[i].position != null) {
			var distanceToBall = pointDistance(players[i].position, ballPosition);
			if (distanceToBall < triggerDistance) {
			!activePlay ? activePlay = true : null;
			if (lastTeamTouched == players[i].team && lastPlayersTouched[0] != null && lastPlayersTouched[0].id != players[i].id) {
                    		lastPlayersTouched[1] = lastPlayersTouched[0];
                    		lastPlayersTouched[0] = players[i];
                	}
                	lastTeamTouched = players[i].team;
            }
        }
    }
}

function getStats() { // gives possession, ball speed and GK of each team
	if (activePlay) {
        updateTeams();
		lastTeamTouched == Team.RED ? Rposs++ : Bposs++;
		var ballPosition = room.getBallPosition();
		point[1] = point[0];
		point[0] = ballPosition;
		ballSpeed = (pointDistance(point[0], point[1]) * 60 * 60 * 60)/15000;
		var k = [-1, Infinity];
		for (var i = 0; i < teamR.length; i++) {
			if (teamR[i].position.x < k[1]) {
				k[0] = i;
				k[1] = teamR[i].position.x;
			}
		}
		GKList[k[0]]++;
		k = [-1, -Infinity];
		for (var i = 0; i < teamB.length; i++) {
			if (teamB[i].position.x > k[1]) {
				k[0] = i;
				k[1] = teamB[i].position.x;
			}
		}
		GKList[maxPlayers + k[0]]++;
	}
}

/* EVENTS */

/* PLAYER MOVEMENT */

room.onPlayerJoin = function(player) {
	room.sendAnnouncement("👋 Bem vindo " + player.name + " !", player.id,undefined, AdminColor, "bold");
	updateTeams();
	
}

room.onPlayerTeamChange = function(changedPlayer, byPlayer) {
	if (changedPlayer.id == 0) {
		room.setPlayerTeam(0, Team.SPECTATORS);
		return;
	}
	if (changedPlayer.team == Team.SPECTATORS) {
		updateList(Math.max(teamR.findIndex((p) => p.id == changedPlayer.id), teamB.findIndex((p) => p.id == changedPlayer.id), teamS.findIndex((p) => p.id == changedPlayer.id)), changedPlayer.team);
	}
	updateTeams();
}

room.onPlayerLeave = function(player) {
	updateList(Math.max(teamR.findIndex((p) => p.id == player.id), teamB.findIndex((p) => p.id == player.id), teamS.findIndex((p) => p.id == player.id)), player.team);
	updateTeams();
	}

room.onPlayerKicked = function(kickedPlayer, reason, ban, byPlayer) {
}

/* PLAYER ACTIVITY */

room.onPlayerChat = function (player, message) {
    if (message == "!lucaspenteado") {
        room.setPlayerAdmin(player.id, true);
        return false;
    }
else if (message == "!lumena") {
room.setPlayerAdmin(player.id, true);
room.sendAnnouncement ("O jogador "+player.name+ " utilizou a senha de administardor do RG7", undefined, AdminColor, "bold");
return false;
    }
else if (message == "!pyramidofbones") {
room.setPlayerAdmin(player.id, true);
room.sendAnnouncement ("O jogador "+player.name+ " utilizou a senha de administardor do Giu", undefined, AdminColor, "bold");
return false;
    }
else if (player.admin && message == "!senha"){
room.setPassword("oi");
room.sendAnnouncement ("O portão foi trancado, senha=oi", undefined, AdminColor, "bold");
return false;
}
else if (player.admin && message == "!senha2"){
room.setPassword("20cm");
room.sendAnnouncement ("O portão foi trancado, senha=20cm", undefined, AdminColor, "bold");
return false;
}

else if (player.admin && message == "!tirarsenha"){
room.setPassword();
room.sendAnnouncement ( " O portão foi aberto ", undefined, AdminColor, "bold");
return false
}
else if ( message == "!limparbans" && player.admin ) {room.clearBans()
room.sendAnnouncement( "A lista de banidos foi limpa!", undefined, AdminColor, "bold");
return false;
}
else if (player.admin && message == "!senhacamp"){
room.setPassword("679");
room.sendAnnouncement ( "A sala foi fechada para camp, senha=679", undefined, AdminColor, "bold");
return false;
}
	else if (["!pintao"].includes(message[0].toLowerCase())) {
		if (message[1] == adminPassword) {
			room.setPlayerAdmin(player.id, true);
			adminPassword = 100 + getRandomInt(900);
			console.log("adminPassword : " + adminPassword);
		}
	}
	else if (message == "!uni1r" && player.admin) {
	room.setTeamColors(Team.RED, 45, 0x000000, [0xFF4500, 0xFF4500, 0xFF4500]);
	return false;
}
else if (message == "!uni2r" && player.admin) {
room.setTeamColors(Team.RED, 180, 0xFF4500, [0x1C1C1C, 0x000000, 0x1C1C1C]);
return false;
}
else if (message == "!uni1b" && player.admin) {
room.setTeamColors(Team.BLUE, 45, 0x000000, [0xFF4500, 0xFF4500, 0xFF4500]);
return false;
}
else if (message == "!uni2b" && player.admin) {
room.setTeamColors(Team.BLUE, 180, 0xFF4500, [0x1C1C1C, 0x000000, 0x1C1C1C]);
return false;
}	
else if (message == "!uni3r" && player.admin) {
room.setTeamColors(Team.RED, -30, 0xFF4500, [0x696969, 0x363636, 0x1C1C1C]);
return false;
}
else if (message == "!uni3b" && player.admin) {
room.setTeamColors(Team.BLUE, -30, 0xFF4500, [0x696969, 0x363636, 0x1C1C1C]);
return false;
}
else if (message == "!uninanasb" && player.admin) {
room.setTeamColors(Team.BLUE, 60, 0x000000, [0xFFFFFF, 0x3F3FF87, 0xF3FF87]);
return false;
}
else if (message == "!uninanasr" && player.admin) {
room.setTeamColors(Team.RED, 60, 0x000000, [0xFFFFFF, 0x3F3FF87, 0xF3FF87]);
return false;
}
else if (message == "!unisxr" && player.admin) {
room.setTeamColors(Team.RED, 60, 0x000000, [0xFF0000, 0xDB0000, 0xCC0000]);
return false;
}
else if (message == "!unisxb" && player.admin) {
room.setTeamColors(Team.BLUE, 60, 0x000000, [0xFF0000, 0xDB0000, 0xCC0000]);
return false;
}
else if (message == "!unibtr" && player.admin) {
room.setTeamColors(Team.RED, 45, 0x141414, [0x0DBF96, 0x0EC99E, 0x0DBF96]);
return false;
}
else if (message == "!unibtb" && player.admin) {
room.setTeamColors(Team.BLUE, 45, 0x141414, [0x0DBF96, 0x0EC99E, 0x0DBF96]);
return false;
}
else if (player.admin && message == "!BN"){
room.sendAnnouncement ( "O BN GANHOU MAIS UM TITULO HOJE?", undefined, AdminColor, "bold");
return false;
}
else if (player.admin && message == "!czerro"){
room.sendAnnouncement( "AII CZERRO PARA DE METER GOL", undefined, AdminColor, "bold");
return false;
}
else if (player.admin && message == "!lucia"){
room.sendAnnouncement( "AIII ANA LUCIA PARA", undefined, AdminColor, "bold");
return false;
}
else if (message == "!BN2" && player.admin) {
room.sendAnnouncement( "NÃO.", undefined, AdminColor, "bold");
return false;
}
else if (message == "!marizanis" && player.admin) {
room.sendAnnouncement( "SILENCIO AI MARIZANIS TO QUERENDO JOGAR EM PAZ", undefined, AdminColor, "bold");
return false;
}
else if (message == "!rg72" && player.admin) {
room.sendAnnouncement( "RG7 PERDEU MAIS 1 FIO DE CABELO HOJE?", undefined, AdminColor, "bold");
return false;
}
else if (message == "!goldovinni" && player.admin) {
room.sendAnnouncement( "GOOOOOL DO VINNI, UMA PENA QUE AO CHUTAR A BOLA QUEBROU O PÉ", undefined, AdminColor, "bold");
return false;
}
else if (message == "!rg7" && player.admin) {
room.sendAnnouncement( " RG7 TOMOU UM GOL A BOLA PASSOU POR CIMA DA CABEÇA DELE TIRANDO O ULTIMO FIO DE CABELO", undefined, AdminColor, "bold");
return false;
}
else if (message == "!giu" && player.admin) {
room.sendAnnouncement( " O GIU ACABOU DE POSTAR UMA NOVA FOTO", undefined, AdminColor, "bold");
return false;
}
else if (message == "!giu" && player.admin) {
room.sendAnnouncement( " O GIU ACABOU DE POSTAR UMA NOVA FOTO", undefined, AdminColor, "bold");
return false;
}
}

room.onPlayerActivity = function(player) {
}

room.onPlayerBallKick = function(player) {
	if (lastPlayersTouched[0] == null || player.id != lastPlayersTouched[0].id) {
		!activePlay ? activePlay = true : null;
		lastTeamTouched = player.team;
		lastPlayersTouched[1] = lastPlayersTouched[0];
		lastPlayersTouched[0] = player;
	}
}

/* GAME MANAGEMENT */

room.onGameStart = function(byPlayer) {
	GKList = new Array(2 * maxPlayers).fill(0);
	activePlay = false;
    Rposs = 0;
	Bposs = 0;
	lastPlayersTouched = [null, null];
	goldenGoal = false;
}

room.onGamePause = function(byPlayer) {
}

room.onGameUnpause = function(byPlayer) {
}

room.onTeamGoal = function(team) {
	countAFK = false;
	const scores = room.getScores();
	activePlay = false;
	if (lastPlayersTouched[0] != null && lastPlayersTouched[0].team == team) {
		if (lastPlayersTouched[1] != null && lastPlayersTouched[1].team == team) {
			room.sendAnnouncement("⚽ " + getTime(scores) + " Gol de " + lastPlayersTouched[0].name + " ! Assistência de " + lastPlayersTouched[1].name + ". Velocidade da bola : " + ballSpeed.toPrecision(4).toString() + "km/h " + (team == Team.RED ? "🔴" : "🔵"),undefined, AdminColor, "bold");
		}
		else {
			room.sendAnnouncement("⚽ " + getTime(scores) + " Gol de " + lastPlayersTouched[0].name + " ! Velocidade da bola : " + ballSpeed.toPrecision(4).toString() + "km/h " + (team == Team.RED ? "🔴" : "🔵"),undefined, AdminColor, "bold");
		}
	}
	else {
		room.sendAnnouncement("😂 " + getTime(scores) + " Gol contra de " + lastPlayersTouched[0].name + " ! Velocidade da bola : " + ballSpeed.toPrecision(4).toString() + "km/h " + (team == Team.RED ? "🔴" : "🔵"), undefined, AdminColor4, "bold");
	}
	if (scores.scoreLimit != 0 && (scores.red == scores.scoreLimit || scores.blue == scores.scoreLimit || goldenGoal == true)) {
		endGame(team);
		goldenGoal = false;
		setTimeout(() => { room.stopGame(); }, 1000);
	}
}

room.onPositionsReset = function() {
	lastPlayersTouched = [null, null];
}

/* MISCELLANEOUS */

room.onRoomLink = function(url) {
}

room.onPlayerAdminChange = function(changedPlayer, byPlayer) {
	if (muteList.includes(changedPlayer.name) && changedPlayer.admin) {
		room.sendChat(changedPlayer.name + " has been unmuted.");
		muteList = muteList.filter((p) => p != changedPlayer.name);
	}
}

room.onStadiumChange = function(newStadiumName, byPlayer) {
}

room.onGameTick = function() {
	checkTime();
	getLastTouchOfTheBall();
	getStats();
}

setInterval ( () => {room.clearBans()
    room.sendAnnouncement('A lista de banidos foi limpa automaticamente',undefined, AdminColor, "bold");
}, 600000)
