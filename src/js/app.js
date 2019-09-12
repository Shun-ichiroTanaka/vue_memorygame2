import Vue from 'vue'
import moment from 'moment'
import _ from 'lodash';
import SocialSharing from 'vue-social-sharing'
Vue.use(SocialSharing)

let CardTypes = [
	{ name: "suda1", image: "./dist/img/1.jpg" },
    { name: "suda2", image: "./dist/img/2.jpg" },
    { name: "suda3", image: "./dist/img/3.jpg" },
    { name: "suda4", image: "./dist/img/4.jpg" },
    { name: "suda5", image: "./dist/img/5.jpg" },
    { name: "suda6", image: "./dist/img/6.jpg" },
    { name: "suda7", image: "./dist/img/7.jpg" },
    { name: "suda8", image: "./dist/img/8.jpg" },
    { name: "suda9", image: "./dist/img/9.jpg" },
    { name: "suda10", image: "./dist/img/10.jpg" },
];

let shuffleCards = () => {
	let cards = [].concat(_.cloneDeep(CardTypes), _.cloneDeep(CardTypes));
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

		flippedCards() {
			return _.filter(this.cards, card => card.flipped);
		},

		sameFlippedCard() {
			let flippedCards = this.flippedCards();
			if (flippedCards.length == 2) {
				if (flippedCards[0].name == flippedCards[1].name)
					return true;
			}
		},

		setCardFounds() {
			_.each(this.cards, (card) => {
				if (card.flipped)
					card.found = true;
			});
		},

		checkAllFound() {
			let foundCards = _.filter(this.cards, card => card.found);
			if (foundCards.length == this.cards.length)
				return true;
		},

		startGame() {
			this.started = true;
			this.startTime = moment();

			this.timer = setInterval(() => {
				this.time = moment(moment().diff(this.startTime)).format("mm:ss");
			}, 1000);
		},

		finishGame() {
			this.started = false;
			clearInterval(this.timer);
			let score = 1000 - (moment().diff(this.startTime, 'seconds') - CardTypes.length * 5) * 3 - (this.turns - CardTypes.length) * 5;
			this.score = Math.max(score, 0);
			this.showSplash = true;
		},

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
			_.map(this.cards, card => card.flipped = false);
		},


		clearFlipBackTimer() {
			clearTimeout(this.flipBackTimer);
			this.flipBackTimer = null;
		}
	},

	created() {
		this.resetGame();
	}
});