/**
 * Provides a set of classes and methods for handling Neuroevolution and
 * genetic algorithms.
 *
 * @param {options} An object of options for Neuroevolution.
 */
let Neuroevolution = function (options) {
	let self = this; // reference to the top scope of this module
	console.log(self)
	// Declaration of module parameters (options) and default values
	self.options = {
		/**
		 * Logistic activation function.
		 *
		 * @param {a} Input value.
		 * @return Logistic function output.
		 */
		activation: 1, //Customed in game.js
			//let ap = (-a) / 1;
			//let as = (a**2);
			/*good = Math.log(1 + Math.exp(ap))
				Math.sin(a)
				second and third gen GOD = a / 1 + Math.abs(a)
				Math.atan(-a) better than  Math.atan(a)
				Обратный квадратный линейный корень =
					a < 0 ? (a / Math.sqrt(1 + Math.sin(a)*(a**2))) : (a)
				1 генерация просто = Math.cosh(a) * -a*3

			*/
			// проверить графики http://www.yotx.ru/
			//bad = 1 / (1 + Math.exp(ap)) 
				//Math.exp(-(a**2))

		/**
		 * Returns a random value between -1 and 1.
		 *
		 * @return Random value.
		 */
		randomClamped: () => Math.random() * 2 - 1,

		// letious factors and parameters (along with default values).
		network: [1, [1], 1], // Perceptron network structure (1 hidden
		// layer).
		population: 50, // Population by generation.
		elitism: 0.2, // Best networks kepts unchanged for the next
		// generation (rate).
		randomBehaviour: 0.2, // New random networks for the next generation
		// (rate).
		mutationRate: 0.1, // Mutation rate on the weights of synapses.
		mutationRange: 0.5, // Interval of the mutation changes on the
		// synapse weight.
		historic: 0, // Latest generations saved.
		lowHistoric: false, // Only save score (not the network).
		scoreSort: -1, // Sort order (-1 = desc, 1 = asc).
		nbChild: 1 // Number of children by breeding.

	}	
console.log(self.options.population)
	/**
	 * Override default options.
	 *
	 * @param {options} An object of Neuroevolution options.
	 * @return void
	 */
	self.set = function (options) {
		for (let i in options) {
			if (this.options[i] != undefined) { // Only override if the passed in value
				// is actually defined.
				self.options[i] = options[i];
			}
		}
	}

	// Overriding default options with the pass in options
	self.set(options);


	/*NEURON**********************************************************************/
	/**
	 * Artificial Neuron class
	 *
	 * @constructor
	 */
	let Neuron = function () {
		this.value = 0;
		this.weights = [];
	}

	/**
	 * Initialize number of neuron weights to random clamped values.
	 *
	 * @param {nb} Number of neuron weights (number of inputs).
	 * @return void
	 */
	Neuron.prototype.populate = function (nb) {
		this.weights = [];
		for (let i = 0; i < nb; i++) {
			this.weights.push(self.options.randomClamped());
		}
	}


	/*LAYER***********************************************************************/
	/**
	 * Neural Network Layer class.
	 *
	 * @constructor
	 * @param {index} Index of this Layer in the Network.
	 */
	let Layer = function (index) {
		this.id = index || 0;
		this.neurons = [];
	}

	/**
	 * Populate the Layer with a set of randomly weighted Neurons.
	 *
	 * Each Neuron be initialied with nbInputs inputs with a random clamped
	 * value.
	 *
	 * @param {nbNeurons} Number of neurons.
	 * @param {nbInputs} Number of inputs.
	 * @return void
	 */
	Layer.prototype.populate = function (nbNeurons, nbInputs) {
		this.neurons = [];
		for (let i = 0; i < nbNeurons; i++) {
			let n = new Neuron();
			n.populate(nbInputs);
			this.neurons.push(n);
		}
	}


	/*NEURAL NETWORK**************************************************************/
	/**
	 * Neural Network class
	 *
	 * Composed of Neuron Layers.
	 *
	 * @constructor
	 */
	let Network = function () {
		this.layers = [];
	}

	/**
	 * Generate the Network layers.
	 *
	 * @param {input} Number of Neurons in Input layer.
	 * @param {hidden} Number of Neurons per Hidden layer.
	 * @param {output} Number of Neurons in Output layer.
	 * @return void
	 */
	Network.prototype.perceptronGeneration = function (input, hiddens, output) {
		let index = 0;
		let previousNeurons = 0;
		let layer = new Layer(index);
		layer.populate(input, previousNeurons); // Number of Inputs will be set to
		// 0 since it is an input layer.
		previousNeurons = input; // number of input is size of previous layer.
		this.layers.push(layer);
		index++;
		for (let i in hiddens) {
			// Repeat same process as first layer for each hidden layer.
			let layer = new Layer(index);
			layer.populate(hiddens[i], previousNeurons);
			previousNeurons = hiddens[i];
			this.layers.push(layer);
			index++;
		}
		layer = new Layer(index);
		layer.populate(output, previousNeurons); // Number of input is equal to
		// the size of the last hidden
		// layer.
		this.layers.push(layer);
	}

	/**
	 * Create a copy of the Network (neurons and weights).
	 *
	 * Returns number of neurons per layer and a flat array of all weights.
	 *
	 * @return Network data.
	 */
	Network.prototype.getSave = function () {
		let datas = {
			neurons: [], // Number of Neurons per layer.
			weights: [] // Weights of each Neuron's inputs.
		};

		for (let i in this.layers) {
			datas.neurons.push(this.layers[i].neurons.length);
			for (let j in this.layers[i].neurons) {
				for (let k in this.layers[i].neurons[j].weights) {
					// push all input weights of each Neuron of each Layer into a flat
					// array.
					datas.weights.push(this.layers[i].neurons[j].weights[k]);
				}
			}
		}
		return datas;
	}

	/**
	 * Apply network data (neurons and weights).
	 *
	 * @param {save} Copy of network data (neurons and weights).
	 * @return void
	 */
	Network.prototype.setSave = function (save) {
		let previousNeurons = 0;
		let index = 0;
		let indexWeights = 0;
		this.layers = [];
		for (let i in save.neurons) {
			// Create and populate layers.
			let layer = new Layer(index);
			layer.populate(save.neurons[i], previousNeurons);
			for (let j in layer.neurons) {
				for (let k in layer.neurons[j].weights) {
					// Apply neurons weights to each Neuron.
					layer.neurons[j].weights[k] = save.weights[indexWeights];

					indexWeights++; // Increment index of flat array.
				}
			}
			previousNeurons = save.neurons[i];
			index++;
			this.layers.push(layer);
		}
	}

	/**
	 * Compute the output of an input.
	 *
	 * @param {inputs} Set of inputs.
	 * @return Network output.
	 */
	Network.prototype.compute = function (inputs) {
		// Set the value of each Neuron in the input layer.
		for (let i in inputs) {
			if (this.layers[0] && this.layers[0].neurons[i]) {
				this.layers[0].neurons[i].value = inputs[i];
			}
		}

		let prevLayer = this.layers[0]; // Previous layer is input layer.
		for (let i = 1; i < this.layers.length; i++) {
			for (let j in this.layers[i].neurons) {
				// For each Neuron in each layer.
				let sum = 0;
				for (let k in prevLayer.neurons) {
					// Every Neuron in the previous layer is an input to each Neuron in
					// the next layer.
					sum += prevLayer.neurons[k].value *
						this.layers[i].neurons[j].weights[k];
				}

				// Compute the activation of the Neuron.
				this.layers[i].neurons[j].value = self.options.activation(sum);
			}
			prevLayer = this.layers[i];
		}

		// All outputs of the Network.
		let out = [];
		let lastLayer = this.layers[this.layers.length - 1];
		for (let i in lastLayer.neurons) {
			out.push(lastLayer.neurons[i].value);
		}
		return out;
	}


	/*GENOME**********************************************************************/
	/**
	 * Genome class.
	 *
	 * Composed of a score and a Neural Network.
	 *
	 * @constructor
	 *
	 * @param {score}
	 * @param {network}
	 */
	let Genome = function (score, network) {
		this.score = score || 0;
		this.network = network || null;
	}


	/*GENERATION******************************************************************/
	/**
	 * Generation class.
	 *
	 * Composed of a set of Genomes.
	 *
	 * @constructor
	 */
	let Generation = function () {
		this.genomes = [];
	}

	/**
	 * Add a genome to the generation.
	 *
	 * @param {genome} Genome to add.
	 * @return void.
	 */
	Generation.prototype.addGenome = function (genome) {
		let i = 0;
		// Locate position to insert Genome into.
		// The gnomes should remain sorted.
		for (; i < this.genomes.length; i++) {
			// Sort in descending order.
			if (self.options.scoreSort < 0) {
				if (genome.score > this.genomes[i].score) {
					break;
				}
				// Sort in ascending order.
			} else {
				if (genome.score < this.genomes[i].score) {
					break;
				}
			}

		}

		// Insert genome into correct position.
		this.genomes.splice(i, 0, genome);
	}

	/**
	 * Breed to genomes to produce offspring(s).
	 *
	 * @param {g1} Genome 1.
	 * @param {g2} Genome 2.
	 * @param {nbChilds} Number of offspring (children).
	 */
	Generation.prototype.breed = function (g1, g2, nbChilds) {
		let datas = [];
		for (let nb = 0; nb < nbChilds; nb++) {
			// Deep clone of genome 1.
			let data = JSON.parse(JSON.stringify(g1));
			for (let i in g2.network.weights) {
				// Genetic crossover
				// 0.5 is the crossover factor.
				// FIXME Really should be a predefined constant.
				if (Math.random() <= 0.5) {
					data.network.weights[i] = g2.network.weights[i];
				}
			}

			// Perform mutation on some weights.
			for (let i in data.network.weights) {
				if (Math.random() <= self.options.mutationRate) {
					data.network.weights[i] += Math.random() *
						self.options.mutationRange *
						2 -
						self.options.mutationRange;
				}
			}
			datas.push(data);
		}

		return datas;
	}

	/**
	 * Generate the next generation.
	 *
	 * @return Next generation data array.
	 */
	Generation.prototype.generateNextGeneration = function () {
		let nexts = [];

		for (let i = 0; i < Math.round(self.options.elitism *
				self.options.population); i++) {
			if (nexts.length < self.options.population) {
				// Push a deep copy of ith Genome's Nethwork.
				nexts.push(JSON.parse(JSON.stringify(this.genomes[i].network)));
			}
		}

		for (let i = 0; i < Math.round(self.options.randomBehaviour *
				self.options.population); i++) {
			let n = JSON.parse(JSON.stringify(this.genomes[0].network));
			for (let k in n.weights) {
				n.weights[k] = self.options.randomClamped();
			}
			if (nexts.length < self.options.population) {
				nexts.push(n);
			}
		}

		let max = 0;
		while (true) {
			for (let i = 0; i < max; i++) {
				// Create the children and push them to the nexts array.
				let childs = this.breed(this.genomes[i], this.genomes[max],
					(self.options.nbChild > 0 ? self.options.nbChild : 1));
				for (let c in childs) {
					nexts.push(childs[c].network);
					if (nexts.length >= self.options.population) {
						// Return once number of children is equal to the
						// population by generatino value.
						return nexts;
					}
				}
			}
			max++;
			if (max >= this.genomes.length - 1) {
				max = 0;
			}
		}
	}


	/*GENERATIONS*****************************************************************/
	/**
	 * Generations class.
	 *
	 * Hold's previous Generations and current Generation.
	 *
	 * @constructor
	 */
	let Generations = function () {
		this.generations = [];
		let currentGeneration = new Generation();
	}

	/**
	 * Create the first generation.
	 *
	 * @param {input} Input layer.
	 * @param {input} Hidden layer(s).
	 * @param {output} Output layer.
	 * @return First Generation.
	 */
	Generations.prototype.firstGeneration = function (input, hiddens, output) {
		// FIXME input, hiddens, output unused.

		let out = [];
		for (let i = 0; i < self.options.population; i++) {
			// Generate the Network and save it.
			let nn = new Network();
			nn.perceptronGeneration(self.options.network[0],
				self.options.network[1],
				self.options.network[2]);
			out.push(nn.getSave());
		}

		this.generations.push(new Generation());
		return out;
	}

	/**
	 * Create the next Generation.
	 *
	 * @return Next Generation.
	 */
	Generations.prototype.nextGeneration = function () {
		if (this.generations.length == 0) {
			// Need to create first generation.
			return false;
		}

		let gen = this.generations[this.generations.length - 1]
			.generateNextGeneration();
		this.generations.push(new Generation());
		return gen;
	}

	/**
	 * Add a genome to the Generations.
	 *
	 * @param {genome}
	 * @return False if no Generations to add to.
	 */
	Generations.prototype.addGenome = function (genome) {
		// Can't add to a Generation if there are no Generations.
		if (this.generations.length == 0) return false;

		// FIXME addGenome returns void.
		return this.generations[this.generations.length - 1].addGenome(genome);
	}


	/*SELF************************************************************************/
	self.generations = new Generations();

	/**
	 * Reset and create a new Generations object.
	 *
	 * @return void.
	 */
	self.restart = function () {
		self.generations = new Generations();
	}

	/**
	 * Create the next generation.
	 *
	 * @return Neural Network array for next Generation.
	 */
	self.nextGeneration = function () {
		let networks = [];

		if (self.generations.generations.length == 0) {
			// If no Generations, create first.
			networks = self.generations.firstGeneration();
		} else {
			// Otherwise, create next one.
			networks = self.generations.nextGeneration();
		}

		// Create Networks from the current Generation.
		let nns = [];
		for (let i in networks) {
			let nn = new Network();
			nn.setSave(networks[i]);
			nns.push(nn);
		}

		if (self.options.lowHistoric) {
			// Remove old Networks.
			if (self.generations.generations.length >= 2) {
				let genomes =
					self.generations
					.generations[self.generations.generations.length - 2]
					.genomes;
				for (let i in genomes) {
					delete genomes[i].network;
				}
			}
		}

		if (self.options.historic != -1) {
			// Remove older generations.
			if (self.generations.generations.length > self.options.historic + 1) {
				self.generations.generations.splice(0,
					self.generations.generations.length - (self.options.historic + 1));
			}
		}

		return nns;
	}

	/**
	 * Adds a new Genome with specified Neural Network and score.
	 *
	 * @param {network} Neural Network.
	 * @param {score} Score value.
	 * @return void.
	 */
	self.networkScore = function (network, score) {
		self.generations.addGenome(new Genome(score, network.getSave()));
	}
}
