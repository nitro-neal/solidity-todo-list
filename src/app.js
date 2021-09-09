App = {
  loading: false,
  contracts: {},
  load: async () => {
    // Load app...
    console.log("App Loading");

    await App.loadWeb3();
    await App.loadAccount();
    await App.loadContract();
    await App.render();
    await App.renderTasks();
  },

  // https://medium.com/metamask/https-medium-com-metamask-breaking-change-injecting-web3-7722797916a8
  loadWeb3: async () => {
    if (typeof web3 !== "undefined") {
      App.web3Provider = web3.currentProvider;
      web3 = new Web3(web3.currentProvider);
    } else {
      window.alert("Please connect to Metamask.");
    }
    // Modern dapp browsers...
    if (window.ethereum) {
      console.log("modern");
      console.log({ ethereum });
      window.web3 = new Web3(ethereum);
      try {
        // Request account access if needed
        await ethereum.enable();
        // Acccounts now exposed
        web3.eth.sendTransaction({
          /* ... */
        });
      } catch (error) {
        // User denied account access...
      }
    }
    // Legacy dapp browsers...
    else if (window.web3) {
      console.log("legacy");
      App.web3Provider = web3.currentProvider;
      window.web3 = new Web3(web3.currentProvider);
      // Acccounts always exposed
      web3.eth.sendTransaction({
        /* ... */
      });
    }
    // Non-dapp browsers...
    else {
      console.log(
        "Non-Ethereum browser detected. You should consider trying MetaMask!"
      );
    }
  },

  loadAccount: async () => {
    await ethereum.enable();
    // console.log({ web3 });
    // console.log(web3.eth.accounts[0]);
    App.account = await web3.eth.accounts[0];
    console.log(App.account);
  },

  loadContract: async () => {
    const todoList = await $.getJSON("TodoList.json");
    // console.log(todoList);
    App.contracts.TodoList = TruffleContract(todoList);
    console.log(App.web3Provider);
    App.contracts.TodoList.setProvider(App.web3Provider);
    // App.contracts.TodoList.setProvider(window.web3.currentProvider);
    // App.contracts.TodoList.setProvider(
    //   new Web3.providers.HttpProvider("http://127.0.0.1:7545")
    // );

    App.todoList = await App.contracts.TodoList.deployed();
    console.log(App.todoList);
  },

  render: async () => {
    if (App.loading) {
      return;
    }

    App.setLoading(true);
    $("#account").html(App.account);

    App.setLoading(false);
  },

  renderTasks: async () => {
    console.log("start render");
    console.log(App.todoList);
    const taskCount = await App.todoList.taskCount();
    console.log(taskCount);
    const $taskTemplate = $(".taskTemplate");

    for (var i = 1; i <= taskCount; i++) {
      const task = await App.todoList.tasks(i);
      const taskId = task[0].toNumber();
      const taskContent = task[1];
      const taskCompleted = task[2];

      const $newTaskTemplate = $taskTemplate.clone();
      $newTaskTemplate.find(".content").html(taskContent);
      $newTaskTemplate
        .find("input")
        .prop("name", taskId)
        .prop("checked", taskCompleted)
        .on("click", App.toggleCompleted);

      if (taskCompleted) {
        $("#completedTaskList").append($newTaskTemplate);
      } else {
        $("#taskList").append($newTaskTemplate);
      }

      console.log($newTaskTemplate);

      $newTaskTemplate.show();
    }
  },

  createTask: async () => {
    App.setLoading(true);
    const content = $("#newTask").val();
    await App.todoList.createTask(content);
    window.location.reload();
  },

  toggleCompleted: async (e) => {
    App.setLoading(true);
    const taskId = e.target.name;
    await App.todoList.toggleCompleted(taskId);
    window.location.reload();
  },

  setLoading: (boolean) => {
    App.loading = boolean;
    const loader = $("#loader");
    const content = $("#content");
    if (boolean) {
      loader.show();
      content.hide();
    } else {
      loader.hide();
      content.show();
    }
  },
};

$(() => {
  $(window).load(() => {
    App.load();
  });
});
