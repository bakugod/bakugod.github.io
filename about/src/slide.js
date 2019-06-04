const button = document.querySelector(".infoButton");
const container = document.querySelector(".container");

class Machine{
    constructor(){
        this.loadWindow = document.querySelector(".fetching");
        this.mainWindow = document.querySelector(".slide-1");
        this.toDefault  = document.querySelector(".close");
        this.info       = document.querySelector(".slide-2");

        this.startState =  this.defaultState();
        this.counter = 1;
    }
    defaultState(){
        this.mainWindow.className = "slide-1";
        this.loadWindow.className = "fetching hidden";
        this.info.className       = "slide-2 hidden";
    }
    onLoad(){
        this.loadWindow.className = "fetching visible";
        this.mainWindow.className = "slide-1";
        this.info.className       = "slide-2 hidden";
    }
    onShow(){
        this.loadWindow.className = "fetching hidden";
        this.mainWindow.className = "slide-1";
        this.info.className       = "slide-2 visible";

        this.toDefault.onclick    = () =>{
            return this.defaultState();
        }
    }
    onError(){
        this.info.className       = "slide-2 hidden";
        this.loadWindow.innerText = "Something go wrong";
    }
    onClick(){
        
    }
}
new Machine();

let counter = 0;
button.addEventListener("click", async () =>{
    const Load       = await setTimeout(() => new Machine().onLoad(), 10);
    const Show       = await setTimeout(() => new Machine().onShow(), 1000);
    if (counter < 1){
        new Typed('.greetings',{
            strings : ['Hey there,'],
            typeSpeed : 20,
            startDelay: 1010,
            showCursor: false,
            onComplete: self => {
                new Typed('.about',{
                    strings : ["My name's Alex. I'm programmer focused on Web Development. This is my personal website; or a placeholder for it, which doesn’t contain any information, really..."],
                    typeSpeed : 10,
                    showCursor: false,
                });
            },
        });
    }
    counter++;
})
