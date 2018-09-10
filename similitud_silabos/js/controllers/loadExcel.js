/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
similitudControllers.controller('loadExcel', function($scope) {
			$scope.read = function (workbook) {

				var headerNames = XLSX.utils.sheet_to_json( workbook.Sheets[workbook.SheetNames[0]], { header: 1 })[0];
				var data = XLSX.utils.sheet_to_json( workbook.Sheets[workbook.SheetNames[0]]);

				console.log(headerNames);
				console.log(data);

				for (var row in data)
				{
					Object.keys(data[row]).forEach(function(key) {
					    console.log("Key = >" + key);
					    console.log("Value => " + data[row][key]);
					    console.log("===========================");
					});
				}
			}

			$scope.error = function (e) {
				console.log(e);
			}
});