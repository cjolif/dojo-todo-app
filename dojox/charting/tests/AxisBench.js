/*
 * Licensed Materials - Property of IBM
 * © Copyright IBM Corporation 2010,2011. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 */
dojo.provide("dojox.charting.tests.AxisBench");

dojo.require("dojox.charting.axis2d.Default");

dojo.declare("dojox.charting.tests.AxisBench", dojox.charting.axis2d.Default, {
	render: function(){
		var initTime = new Date().getTime();
		this.inherited(arguments);
		var time = new Date().getTime() - initTime;
		dojox.charting.tests.AxisBench.total+=time;
		console.log("axis rendering time: "+time);
	}
});

dojox.charting.tests.AxisBench.total = 0;

