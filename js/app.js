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
		var that = this
		this.database.ref('/users').once('value').then(function(snapshot) {
			that.users = jQuery.extend(that.users, snapshot.val())
		})

		this.bindActiveUser()

		// Watch for changes to default user
		this.database.ref('carts/' + this.cartId + '/activeUser').on('child_added', function(snapshot) {
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
			}
		})
	},

	bindActiveUser: function() {
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
	}
}

jQuery(function() {
	Firebase.init(FirebaseConfig);
});
