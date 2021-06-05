import React, { useEffect, useState } from 'react';
import { PageTitle } from '../../Components';
import { useHistory } from 'react-router-dom';
import { FormControl, InputLabel, Select, MenuItem, Switch, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField } from '@material-ui/core';
import { HallType, ShowScheduleType, HallListType } from '../../Main/Type';
import { useShowScheduleListState, useFetchShowSchedule, useShowScheduleListObjState } from '../../Main/ShowScheduleModel';
import { useFetchHallFunction, useHallListState } from '../../Main/HallListModel';
import { useFetchMovieFunction, useMovieListObjState } from '../../Main/MovieListModel';
import { ModalComponent } from '../../Components';
import "../../scss/pages/adminshowschedule.scss";
import { getDateString } from "../../Function";

import axios from 'axios';
import { SERVER_URL } from '../../CommonVariable';
import { errorHandler } from '../../Main/ErrorHandler';
import { useTokenState } from '../../Main/TokenModel';

const AdminShowSchedule = () => {
	const AUTH_TOKEN = useTokenState();
	const history = useHistory();
	const fetchShowSchedule = useFetchShowSchedule();
	const fetchHall = useFetchHallFunction();
	const fetchMovie = useFetchMovieFunction();
	const showScheduleList = useShowScheduleListState();
	const showScheduleListObj = useShowScheduleListObjState();
	const hallList = useHallListState();
	const movieList = useMovieListObjState();

	const [mode, setMode] = useState<boolean>(false); // 표 / 리스트

	useEffect(() => {
		fetchShowSchedule();
		fetchHall();
		fetchMovie();
	}, []);

	/* 검색 조건 */
	const [searchHallId, setSearchHallId] = useState<number[]>([]);
	const [searchMovieId, setSearchMovieId] = useState<number[]>([]);
	const [searchStartDate, setSearchStartDate] = useState<string>("");
	const [searchEndDate, setSearchEndDate] = useState<string>("");

	/* 상영일정 관리 */

	const [modalOpen, setModalOpen] = useState<boolean>(false);
	const [modalType, setModalType] = useState<boolean>(true); // 추가(true)인지 수정(false)인지 구분
	const [showId, setShowId] = useState<number>(-1);

	const [hallId, setHallId] = useState<number>(-1);
	const [movieId, setMovieId] = useState<number>(-1);
	const [showDate, setShowDate] = useState<string>("");
	const [showTime, setShowTime] = useState<string>("");

	/* 검색 조건 */
	const search = () => {
		fetchShowSchedule(searchMovieId, searchHallId, searchStartDate, searchEndDate);
	}

	/* 상영일정 관리 */
	const handleModeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		setMode(event.target.checked);
	}

	const saveShowSchedule = () => {
		if (modalType) {
			axios.post(`${SERVER_URL}/showschedule/add`, {
				"movi_id": movieId,
				"hall_id": hallId,
				"show_date": showDate,
				"show_time": showTime
			}, {
				headers: {
					TOKEN: AUTH_TOKEN
				}
			})
				.then((res) => {
					fetchShowSchedule();
					setModalOpen(false);
				})
				.catch((e) => {
					errorHandler(e, true, ["정확한 정보를 입력했는지 다시 한 번 확인해주세요."]);
				});
		} else {
			isBookExist(showId).then((res) => {
				if (!res) {
					axios.put(`${SERVER_URL}/showschedule/`, {
						"show_id": showId,
						"movi_id": movieId,
						"hall_id": hallId,
						"show_date": showDate,
						"show_time": showTime
					}, {
						headers: {
							TOKEN: AUTH_TOKEN
						}
					})
						.then((res) => {
							fetchShowSchedule();
							setModalOpen(false);
						})
						.catch((e) => {
							errorHandler(e, true, ["정확한 정보를 입력했는지 다시 한 번 확인해주세요."]);
						});
				} else {
					alert("해당 상영일정의 예매가 있으므로 상영일정을 수정할 수 없습니다. 예매를 먼저 삭제해주세요.");
				}
			})
		}
	}

	const getHallListMenu = () => {
		if (!hallList)
			return;
		const DOM = [];
		for (const hall_id in hallList) {
			DOM.push(<MenuItem key={hall_id} value={hall_id}>{hallList[hall_id].hall_name}</MenuItem>);
		}
		return DOM;
	}

	const handleHallChange = (e: any) => {
		const hall_id = Number(e.target.value);
		setHallId(hall_id);
	}

	const getMovieListMenu = () => {
		if (!movieList)
			return;
		const DOM = [];
		for (const movi_id in movieList) {
			DOM.push(<MenuItem key={movi_id} value={movi_id}>{movieList[movi_id].movi_name}</MenuItem>);
		}
		return DOM;
	}

	const handleMovieChange = (e: any) => {
		const movi_id = Number(e.target.value);
		setMovieId(movi_id);
	}

	const handleShowTimeChange = (e: any) => {
		let timeString = e.target.value as string;
		timeString = timeString.split(':').join('');
		setShowTime(timeString);
	}

	const handleShowDateChange = (e: any) => {
		let dateString = e.target.value as string;
		dateString = dateString.split('-').join('');
		setShowDate(dateString);
	}

	const handleAddButtonClick = () => { // 추가 버튼 클릭 시
		setModalOpen(true);
		setModalType(true);

		// modal 정보 초기화
		setShowId(-1);
		setHallId(-1);
		setMovieId(-1);
		setShowDate("");
		setShowTime("");
	}

	const isBookExist = (show_id: number) => {
		return axios.get(`${SERVER_URL}/showschedule/${show_id}/book`, {
			headers: {
				TOKEN: AUTH_TOKEN
			}
		})
			.then((res) => {
				return false;
			})
			.catch((e) => {
				return true;
			});
	}

	const handleModifyButtonClick = (show_id: number) => { // 수정 버튼 클릭 시 
		if (!showScheduleListObj || !showScheduleListObj[show_id])
			return;
		setModalOpen(true);
		setModalType(false);

		// 기존 정보 저장
		const schedule: ShowScheduleType = showScheduleListObj[show_id];
		setShowId(show_id);
		setHallId(schedule.hall_id);
		setMovieId(schedule.movi_id);
		setShowDate(schedule.show_date);
		setShowTime(schedule.show_time);
	}

	const removeShowSchedule = (show_id: number) => {
		if (!confirm(`해당 상영일정을 삭제하시겠습니까?`))
			return;

		isBookExist(showId).then((res) => {
			if (!res) {
				axios.delete(`${SERVER_URL}/showschedule/delete/${show_id}`, {
					headers: {
						TOKEN: AUTH_TOKEN
					}
				})
					.then((res) => {
						fetchShowSchedule();
					})
					.catch((e) => {
						errorHandler(e, true);
					});
			} else {
				alert("해당 상영일정의 예매가 있으므로 상영일정을 삭제할 수 없습니다. 예매를 먼저 삭제해주세요.");
			}
		});
	}

	return (
		<div>
			<PageTitle title="상영일정 페이지" isButtonVisible={true} />
			<div className="schedule-con">
				<div className="schedule-header">
					<div className="switch-con">
						<div>리스트</div>
						<Switch
							checked={mode}
							onChange={handleModeChange}
							color="primary"
							name={mode ? "표" : "리스트"}
						/>
						<div>표</div>
					</div>
					<div className="search-con">
						<FormControl>
							<InputLabel id="select-label">상영관 선택</InputLabel>
							<Select
								multiple={true}
								labelId="select-label"
								value={searchHallId}
								onChange={(e: any) => setSearchHallId(e.target.value)}
							>
								{
									getHallListMenu()
								}
							</Select>
						</FormControl>
						<FormControl>
							<InputLabel id="select-label">영화 선택</InputLabel>
							<Select
								multiple={true}
								labelId="select-label"
								value={searchMovieId}
								onChange={(e: any) => setSearchMovieId(e.target.value)}
							>
								{
									getMovieListMenu()
								}
							</Select>
						</FormControl>
						<div>
							<TextField
								type="date"
								label="기간 시작"
								InputLabelProps={{
									shrink: true,
								}}
								value={getDateString(searchStartDate)}
								onChange={(e: any) => setSearchStartDate(e.target.value.split("-").join(""))}
							/>
							<TextField
								type="date"
								label="기간 종료"
								InputLabelProps={{
									shrink: true,
								}}
								value={getDateString(searchEndDate)}
								onChange={(e: any) => setSearchEndDate(e.target.value.split("-").join(""))}
							/>
						</div>
						<Button variant="contained" color="primary" onClick={search}>조건 검색</Button>
					</div>
					<div className="save-btn">
						<Button variant="contained" color="secondary" onClick={handleAddButtonClick}>상영일정 추가</Button>
					</div>
				</div>
				{
					mode ?
						<div>표</div>
						:
						<TableContainer>
							<Table>
								<TableHead>
									<TableRow>
										<TableCell>번호</TableCell>
										<TableCell>상영관</TableCell>
										<TableCell>영화</TableCell>
										<TableCell>개봉일자</TableCell>
										<TableCell>상영시작시각</TableCell>
										<TableCell>상영종료시각</TableCell>
										<TableCell>수정</TableCell>
									</TableRow>
								</TableHead>
								<TableBody>
									{
										showScheduleList &&
										showScheduleList.map((schedule: ShowScheduleType, index: number) => {
											const endTime = schedule.end_time.split("/");
											return (
												<TableRow key={schedule.show_id}>
													<TableCell>{index + 1}</TableCell>
													<TableCell>{schedule.hall_name}</TableCell>
													<TableCell>{schedule.movi_name}</TableCell>
													<TableCell>{`${schedule.show_date.substr(0, 4)}/${schedule.show_date.substr(4, 2)}/${schedule.show_date.substr(6, 2)}`}</TableCell>
													<TableCell>{`${schedule.show_time.substr(0, 2)}시 ${schedule.show_time.substr(2, 2)}분`}</TableCell>
													<TableCell>{`${endTime[endTime.length - 2]}시 ${endTime[endTime.length - 1]}분`}</TableCell>
													<TableCell className="modify-btn-con">
														<Button variant="contained" color="primary" onClick={() => handleModifyButtonClick(schedule.show_id)}>상영일정 수정</Button>
														<Button variant="contained" color="secondary" onClick={() => removeShowSchedule(schedule.show_id)}>상영일정 삭제</Button>
													</TableCell>
												</TableRow>
											);
										})
									}
								</TableBody>
							</Table>
						</TableContainer>
				}
			</div>
			<ModalComponent
				open={modalOpen}
				setOpen={setModalOpen}
				title={modalType ? "상영일정 추가" : "상영일정 수정"}
				button={modalType ? "추가" : "수정"}
				buttonOnClick={saveShowSchedule}
			>
				<div>
					<FormControl>
						<InputLabel id="select-label">상영관</InputLabel>
						<Select
							labelId="select-label"
							value={hallId}
							onChange={handleHallChange}
						>
							{
								getHallListMenu()
							}
						</Select>
					</FormControl>
					<FormControl>
						<InputLabel id="select-label">영화</InputLabel>
						<Select
							labelId="select-label"
							value={movieId}
							onChange={handleMovieChange}
						>
							{
								getMovieListMenu()
							}
						</Select>
					</FormControl>
					<div>
						<TextField
							type="date"
							InputLabelProps={{
								shrink: true,
							}}
							value={getDateString(showDate)}
							onChange={(e: any) => setShowDate(e.target.value.split("-").join(""))}
						/>
						<TextField
							type="time"
							InputLabelProps={{
								shrink: true,
							}}
							value={showTime.substr(0, 2) + ":" + showTime.substr(2, 2)}
							onChange={handleShowTimeChange}
						/>
					</div>
				</div>
			</ModalComponent>
		</div >
	);
}

export default AdminShowSchedule;