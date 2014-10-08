/** @jsx React.DOM */

var TaskBox = React.createClass({
  addNewTaskToList: function(task){
    this.setState({data: this.state.data.concat([task])});
  },
  doAjax: function(methodType, data, url){
    if(!url){
      url = this.props.url; 
    }
    $.ajax({
      url: url,
      dataType: 'json',
      type: methodType,
      data: data,
      success: function(data){
        if(data instanceof Array){
          this.setState({data: data});
        }
      }.bind(this),
      error: function(xhr, status, err){
        console.error(this.props.url, status, err.toString());
      }.bind(this)
    });
  },
  loadTasksFromServer: function() {
    this.doAjax('GET', {});
  },
  handleAddNewTask: function(task) {
    this.addNewTaskToList(task);
    this.doAjax('POST', {task: task});
  },
  handleRemoveTask: function(task){
    this.doAjax('DELETE', {},"tasks/"+task.id+".json");
    this.loadTasksFromServer();
  },
  handleStatusUpdate: function(task){
    this.doAjax('PUT', {task: {status: task.status}},"tasks/"+task.id+".json");
    this.loadTasksFromServer();
  },
  getInitialState: function() {
    return {data: []};
  },
  componentDidMount: function () {
    this.loadTasksFromServer();  
  },
  render: function() {
    return (
      <div className="taskBox">
        <h1>Tasks</h1>
        <TaskList data={this.state.data} onRemoveTask={this.handleRemoveTask} onStatusUpdate={this.handleStatusUpdate} />
        <TaskForm onAddNewTask={this.handleAddNewTask} />
      </div>
    );
  }
});

var TaskList = React.createClass({
  render: function() {
    var removeFunc = this.props.onRemoveTask;
    var updateStatusFunc = this.props.onStatusUpdate;
    var taskNodes = this.props.data.map(function(task){
      return (
        <Task onRemoveTask={removeFunc} onStatusUpdate={updateStatusFunc} status={task.status} id={task.id}>{task.title}</Task>
      );
    });
    return(
      <div className="taskList">
        {taskNodes}
      </div>
    );
    
  }
});


var TaskForm = React.createClass({
  handleSubmit: function(e) {
    e.preventDefault();
    var status = this.refs.status.getDOMNode().checked;
    var title = this.refs.title.getDOMNode().value.trim();
    if(!title) {
      return;
    }
    this.props.onAddNewTask({status: status, title: title});
    this.refs.status.getDOMNode().checked = false;
    this.refs.title.getDOMNode().value = '';
    return;
  },
  render: function() {
    return (
      <form className="taskForm" onSubmit={this.handleSubmit}>
        <input type="checkbox" ref="status" />
        <input type="text" placeholder="Task title here" ref="title" />
        <input type="submit" value="Add Task"/>
      </form>
    );
  }
});


var Task = React.createClass({
  handleRemoveClick: function(e){
    e.preventDefault();
    this.props.onRemoveTask({id: this.props.id});
    return;
  },
  handleStatusChange: function(e){
    this.props.onStatusUpdate({id: this.props.id, status: !this.props.status});
    return;
  },
  render: function() {
    return (
      <div className="task">
        <input type='checkbox' defaultChecked={this.props.status} onChange={this.handleStatusChange} />
        {this.props.children}
        <a id={this.props.id} title='Remove' onClick={this.handleRemoveClick} href="javascript: void(0);">x</a>
      </div>
    );
  }
});


$(function(){
  React.renderComponent(
    <TaskBox url="tasks.json" />,
    document.getElementById('content')
  );  
});
