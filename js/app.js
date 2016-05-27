// Initialize Firebase
var FirebaseConfig = {
	apiKey: "AIzaSyBmxzirhi3p-moZHlA8pWfg6-mV4jp7Dt8",
	authDomain: "smart-shopping-1b7d5.firebaseapp.com",
	databaseURL: "https://smart-shopping-1b7d5.firebaseio.com",
	storageBucket: "smart-shopping-1b7d5.appspot.com",
};

var Firebase = {
	init: function(config) {
		this.firebase = firebase.initializeApp(config);
		this.database = this.firebase.database();
		this.cartId = "cart1";
		this.users = {"default": {"name": "...", "age": "...", "address": "...", "lastPurchase": "..."}};
		this.table = jQuery("#cartContents");
		var that = this
		this.database.ref('/users').once('value').then(function(snapshot) {
			console.log("All users Loaded")
			that.users = jQuery.extend(that.users, snapshot.val())
			that.bindActiveUser()
			// Watch for changes to default user
			that.database.ref('carts/' + that.cartId + '/activeUser').on('child_added', function(snapshot) {
				console.log("Current User is " + snapshot.key)
				that.currentUser.name = that.users[snapshot.key].name
				that.currentUser.age = that.users[snapshot.key].age
				that.currentUser.address = that.users[snapshot.key].address
				if (snapshot.key !== "default") {
					var purchases = that.users[snapshot.key].purchases
					var purchaseKeys = Object.keys(purchases).sort()
					if (purchaseKeys.length == 0) {
						that.currentUser.lastPurchase = "New Customer"
					} else {
						that.currentUser.lastPurchase = purchases[purchaseKeys.sort().pop()].date
					}
				} else {
					that.currentUser.lastPurchase = "..."
					that.refreshUsers()
				}
			});
		});
		this.loadMovies();
	},

	bindActiveUser: function() {
		console.log("Binding User to DOM")
		this.currentUser = Bind({
			name: "...",
			age: "...",
			address: "...",
			lastPurchase: "..."
		}, {
			name: '#cname',
			age: '#cage',
			address: '#caddr',
			lastPurchase: '#cdate'
		})
	},

	refreshUsers: function() {
		var that = this
		this.database.ref('/users').once('value').then(function(snapshot) {
			console.log("Refreshed users")
			that.users = jQuery.extend(that.users, snapshot.val())
		});
	}, 

	addMovieToTable: function(tokenId) {
		var movieId = this.tokenToMovie[tokenId]
		var movie = this.getMovieById(movieId)
		this.table.append("<tr id = \"" +  tokenId + "\"><td>" + movie.movieId + "</td><td>" +  movie.title + "</td><td> ₹<span class=\"priceCell\">" +  movie.price + "</span></td></tr>")
		this.updateTableTotal();
	},

	removeMovieFromTable: function(tokenId) {
		jQuery("#" + tokenId).remove();
		this.updateTableTotal();
	},

	updateTableTotal: function() {
		var sum = 0;
		$(".priceCell").each(function() {
			var price = $(this)
			sum += parseInt(price.html())
		})
		$("#totalCell").html(sum);
	},

	loadMovies: function() {
		var that = this
		jQuery.getJSON("data/movies_processed.json", function(json) {
			that.movies = json
			that.database.ref('/tokenToMovie').once('value').then(function(snapshot) {
				that.tokenToMovie = snapshot.val();
				that.database.ref('carts/' + that.cartId + '/contents').on('child_added', function(snapshot) {
					that.addMovieToTable(snapshot.key)
				});
				that.database.ref('carts/' + that.cartId + '/contents').on('child_removed', function(snapshot) {
					that.removeMovieFromTable(snapshot.key)
				});
			});
		});
	},

	getMovieById: function(id) {
		return this.movies[id - 1];
	}
}

jQuery(function() {
	Firebase.init(FirebaseConfig);
});
