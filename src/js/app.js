import Vue from 'vue'
// JavaScriptのdateオブジェクトは中々に使いづらい。moment.jsはそれを非常に使いやすい形にラッピングしたモジュール
import moment from 'moment'
// lodashは便利な関数をまとめて提供しているライブラリで値の操作に長けた便利関数が数多く存在する
import _ from 'lodash';
// twitterカードなどのSNSの共有を楽にしてくれる
import SocialSharing from 'vue-social-sharing'
Vue.use(SocialSharing)


let CardTypes = [
	{ name: "1", image: "./dist/img/1.jpg" },
    { name: "2", image: "./dist/img/2.jpg" },
    { name: "3", image: "./dist/img/3.jpg" },
    { name: "4", image: "./dist/img/4.jpg" },
    { name: "5", image: "./dist/img/5.jpg" },
    { name: "6", image: "./dist/img/6.jpg" },
    { name: "7", image: "./dist/img/7.jpg" },
    { name: "8", image: "./dist/img/8.jpg" },
    { name: "9", image: "./dist/img/9.jpg" },
    { name: "10", image: "./dist/img/10.jpg" },
];


let shuffleCards = () => {
	// concat() メソッドは、配列に他の配列や値をつないでできた新しい配列を返します。
	let cards = [].concat(_.cloneDeep(CardTypes), _.cloneDeep(CardTypes));
	// つないでできた新しい cards をシャッフルする
	return _.shuffle(cards);
}


new Vue({
	el: "#app",

	data: {
		showSplash: false,
		cards: [],
		started: false,
		startTime: 0,
		turns: 0,
		flipBackTimer: null,
		timer: null,
		time: "--:--",
		score: 0
	},

	methods: {
		resetGame() {
			this.showSplash = false;
			let cards = shuffleCards();
			this.turns = 0;
			this.score = 0;
			this.started = false;
			this.startTime = 0;

			_.each(cards, (card) => {
				card.flipped = false;
				card.found = false;
			});

			this.cards = cards;
		},

		// カードをひっくり返す
		flippedCards() {
			return _.filter(this.cards, card => card.flipped);
		},

		// 同じカードを2枚ひっくり返した場合
		sameFlippedCard() {
			let flippedCards = this.flippedCards();
			if (flippedCards.length == 2) {
				if (flippedCards[0].name == flippedCards[1].name)
					return true;
			}
		},

		// カードがひっくり返されているならそのカードはもう使用済みであるという処理
		setCardFounds() {
			_.each(this.cards, (card) => {
				if (card.flipped)
					card.found = true;
			});
		},

		// 全てのカードが見つかった場合
		checkAllFound() {
			// 「filter」の中で、特定の条件を与えて配列データを取得したい内容を「コールバック関数」に書くことで、
			// 任意のデータを抽出して新しい配列を生成します。
			let foundCards = _.filter(this.cards, card => card.found);
			if (foundCards.length == this.cards.length)
				return true;
		},

		// ゲームスタート
		startGame() {
			this.started = true;
			// momentオブジェクトはjavaScriptのdateオブジェクトをラッピングしたオブジェクト
			this.startTime = moment(); // etc) moment("2019-09-13T14:06:32.809")

			// setInterval() メソッドは、一定の遅延間隔を置いて関数やコードスニペットを繰り返し呼び出します
			this.timer = setInterval(() => {
				this.time = moment(moment().diff(this.startTime)).format("mm:ss");
			}, 1000);
		},

		// ゲーム終了
		finishGame() {
			this.started = false;
			clearInterval(this.timer);
			let score = 120 - (moment().diff(this.startTime, 'seconds') - CardTypes.length * 1) - (this.turns - CardTypes.length) * 1;
			this.score = Math.max(score, 0);
			this.showSplash = true;
		},

		// ゲームリスタート後、ひっくり返されたカードを戻す
		flipCard(card) {
			if (card.found || card.flipped) return;

			if (!this.started) {
				this.startGame();
			}

			let flipCount = this.flippedCards().length;
			if (flipCount == 0) {
				card.flipped = !card.flipped;
			}
			else if (flipCount == 1) {
				card.flipped = !card.flipped;
				this.turns += 1;

				if (this.sameFlippedCard()) {
					// Match!
					// seTimeout()は一定時間経過後に処理を一回だけ実行する
					this.flipBackTimer = setTimeout( ()=> {
						this.clearFlipBackTimer();
						this.setCardFounds();
						this.clearFlips();

						if (this.checkAllFound()) {
							this.finishGame();
						}

					}, 200);
				}
				else {
					// Wrong match
					this.flipBackTimer = setTimeout( ()=> {
						this.clearFlipBackTimer();
						this.clearFlips();
					}, 1000);
				}
			}
		},

		clearFlips() {
			// map()は第1引数「配列（Object）」の各値に第2引数で指定した関数を適用し、結果を配列にして返す。
			_.map(this.cards, card => card.flipped = false);
		},


		clearFlipBackTimer() {
			// clearTimeout()はsetTimeout()でセットしたタイマーを解除する
			clearTimeout(this.flipBackTimer);
			this.flipBackTimer = null;
		}
	},

	created() {
		// resetGame()はゲームを初期化するメソッド
		this.resetGame();
	}
});