/* Copyright (C) 2018 Yousef Sultan <yousef.su.2000@gmail.com> - All Rights Reserved.
 * This document is proprietary and confidential.
 * Unauthorized copying of this file, via any medium, in whole or in part, is strictly prohibited.
 */

export function unionState(oldArray, newArray, oldField, newField) {
	const newIds = newArray.map(newItem => newItem[newField]);

	return [
		...oldArray.filter(oldItem => newIds.indexOf(oldItem[oldField]) === -1),
		...newArray,
	];
}