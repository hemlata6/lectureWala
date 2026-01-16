import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { ShoppingCart, Star, Clock, Users, CheckCircle } from 'lucide-react';
import Network from '../context/Network';
import instId from '../context/instituteId';
import { Box, Button, Card, Checkbox, Chip, Dialog, DialogActions, DialogContent, Divider, FormControl, FormHelperText, Grid, IconButton, InputAdornment, InputLabel, ListItemText, MenuItem, OutlinedInput, Paper, Select, Stack, Step, StepLabel, Stepper, styled, TextField, Tooltip, Typography, useMediaQuery } from '@mui/material';
import axios from 'axios';
import { BASE_URL } from '../context/endpoints';
import parse from "html-react-parser";
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import Check from '@mui/icons-material/Check';
import PropTypes from 'prop-types';
import CheckIcon from '@mui/icons-material/Check';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Endpoints from '../context/endpoints';
import { useStudent } from '../context/StudentContext';
import CloseIcon from "@mui/icons-material/Close";

const QontoStepIconRoot = styled('div')(({ theme, ownerState }) => ({
    color: theme.palette.mode === 'dark' ? theme.palette.grey[700] : '#eaeaf0',
    display: 'flex',
    height: 22,
    alignItems: 'center',
    ...(ownerState.active && {
        color: '#1356C5',
    }),
    '& .QontoStepIcon-completedIcon': {
        color: '#1356C5',
        zIndex: 1,
        fontSize: 18,
    },
    '& .QontoStepIcon-circle': {
        width: 12,
        height: 12,
        borderRadius: '50%',
        backgroundColor: 'currentColor',
    },
}));

function QontoStepIcon(props) {
    const { active, completed, className } = props;

    return (
        <QontoStepIconRoot ownerState={{ active }} className={className}>
            {completed ? (
                <Check className="QontoStepIcon-completedIcon" />
            ) : (
                <div className="QontoStepIcon-circle" />
            )}
        </QontoStepIconRoot>
    );
}

QontoStepIcon.propTypes = {
    /**
     * Whether this step is active.
     * @default false
     */
    active: PropTypes.bool,
    className: PropTypes.string,
    /**
     * Mark the step as completed. Is passed to child components.
     * @default false
     */
    completed: PropTypes.bool,
};

const steps = ['Plans', 'Details', 'Checkout', 'Done'];

const DripCourses = ({ onQuizNavigation, purchaseDripCourse }) => {

    const { isAuthenticated, studentData } = useStudent();
    const isMobile = useMediaQuery("(min-width:600px)");
    const isMobileDevice = useMediaQuery('(min-width:480px)');
    const [selectedSceduleList, setSelectedSceduleList] = useState([]);
    const [sheduleContentList, setSheduleContentList] = useState([]);
    const [courseExpandedDescriptions, setCourseExpandedDescriptions] = useState(false);
    const [fullDes, setFullDes] = useState('');
    const [cartCourses, setCartCourses] = useState([]);

    const [error, setError] = useState('');
    const [selectCourse, setSelectCourse] = useState('');
    const [selectedTag, setSelectedTag] = useState('');
    const [course, setCourse] = useState([]);
    const [filterCourse, setFilterCourse] = useState([]);
    const [suggestedCourse, setSuggestedCourse] = useState([]);
    const [tagsList, setTagsList] = useState([]);
    const [courseContentList, setCourtseContentList] = useState([]);
    const [selectShedule, setSelectShedule] = useState('');
    const [schedule, setSchedule] = useState('');
    const [activeStep, setActiveStep] = useState(0);
    const [completed, setCompleted] = useState({});
    const [title, setTitle] = useState('');
    const [number, setNumber] = useState('');
    const [email, setEmail] = useState('');
    const [addSuggestCourse, setAddSuggestCourse] = useState(false);
    const [selectedIds, setSelectedIds] = useState([]);
    const [totalPrice, setTotalPrice] = useState(0);
    const [purchaseArray, setPurchaseArray] = useState([]);
    const [skipped, setSkipped] = useState(new Set());
    const [alltreeList, setAlltreeList] = useState([]);
    const [activeBtn, setActiveBtn] = useState('both');
    const [selectSubjectWise, setSelectSubjectWise] = useState([]);
    const [subjectWiseListRender, setSubjectWiseListRender] = useState([]);
    const [plansList, setPlansList] = useState([]);
    const [peviewImgVideo, setPeviewImgVideo] = useState({});
    const [checked, setChecked] = useState(false);
    const [coursePublic, setCoursesPublic] = useState({});
    const [orderBumpCourse, setOrderBumpCourse] = useState({});
    const [viewPlanModal, setViewPlanModal] = useState(false);
    const [addtoCartIds, setAddtoCartIds] = useState([]);
    const [addedCartPlans, setAddedCartPlans] = useState([]);
    const [filterGroupSubject, setFilterGroupSubject] = useState('group');
    const [openScheduleModal, setOpenScheduleModal] = useState(false);
    const [couponNumber, setCouponNumber] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [isCouponValid, setIsCouponValid] = useState(null);
    const [couponDiscount, setCouponDiscount] = useState(0);
    const [reedemCode, setReedemCode] = useState(false);
    const [showAllCourses, setShowAllCourses] = useState(false);

    useEffect(() => {
        // Scroll to top on mount
        window.scrollTo(0, 0);

        // Load cart from localStorage on component mount
        const loadCart = () => {
            const cartData = localStorage.getItem('cartCourses');
            if (cartData) {
                try {
                    const cart = JSON.parse(cartData);
                    // Filter cart for drip course items only (items with plan property)
                    const dripCartItems = Array.isArray(cart) ? cart.filter(item => item.plan) : [];
                    setCartCourses(dripCartItems);
                } catch (error) {
                    console.error('Error loading cart:', error);
                    setCartCourses([]);
                }
            }
        };
        loadCart();
    }, []);

    useEffect(() => {
        if (subjectWiseListRender?.length > 0 && filterGroupSubject === "subject" && selectSubjectWise.length === 0) {
            setSelectSubjectWise([subjectWiseListRender[0]]);
        }
    }, [subjectWiseListRender, filterGroupSubject])

    useEffect(() => {
        if (isAuthenticated === true) {
            setTitle(studentData?.firstName + " " + studentData?.lastName);
            setEmail(studentData?.email);
            setNumber(studentData?.contact);
        }
    }, [isAuthenticated, studentData])

    useEffect(() => {
        const allEntityIds = [];
        let totalPrice = 0;
        cartCourses?.forEach((item) => {
            const object = getPlanPrice(item.plan, item.group, item.subject);
            let price = object?.price;
            totalPrice += object?.finalPrice === 0 ? Number(price) - (Number(price / 100) * Number(item?.plan?.discount)) : object?.finalPrice;
            object.entityId.forEach((entity) => {
                allEntityIds.push(entity);
            });
        });
        setTotalPrice(totalPrice)
        setPurchaseArray(allEntityIds);
        localStorage.setItem("purchaseArray", JSON.stringify(allEntityIds));
    }, [cartCourses]);

    useEffect(() => {
        if (purchaseDripCourse?.id) {
            getMergedSchedules(purchaseDripCourse?.id, 0);
        }
    }, [purchaseDripCourse])

    useEffect(() => {
        if (selectedSceduleList?.length > 0) {
            const firstItem = selectedSceduleList[0]
            getSheduleContentList(purchaseDripCourse?.id, firstItem?.id);
            fetchDripContent(firstItem?.id);
        }
    }, [selectedSceduleList])

    const getMergedSchedules = async (courseId, folderId = 0) => {
        try {

            let response = await Network.fetchFreePublicScheduleApi(courseId, folderId);
            setSelectedSceduleList(response?.contentList)

        } catch (error) {
            console.log(error);

        }
    };

    const getSheduleContentList = async (courseId, contentId) => {
        try {
            let requestOptions = {
                // headers: { "X-Auth": token },
                withCredentials: false,
            };
            const response = await axios.get(BASE_URL + `admin/course/fetchContent-public/${courseId}/${contentId}`, requestOptions);
            if (response?.data?.errorCode === 0) {
                let filterCourseContent = response?.data?.contentList;
                setSheduleContentList(filterCourseContent);
            };
        } catch (error) {
            console.log(error);
        }
    }

    const truncateDescription = (description) => {
        // Replace &nbsp; and other HTML entities with plain text equivalents
        const decodedDescription = description
            ?.replace(/&nbsp;/g, ' ')
            ?.replace(/&amp;/g, '&') // Example for handling other entities, can add more if needed
            ?.replace(/&lt;/g, '<')
            ?.replace(/&gt;/g, '>')
            ?.replace(/&quot;/g, '"')
            ?.replace(/&#39;/g, "'");

        // Strip any remaining HTML tags
        const strippedDescription = decodedDescription
            ?.replace(/<[^>]*>/g, ' ') // Remove HTML tags
            ?.split(/\s+/)
            ?.slice(0, 10) // Get first 10 words
            ?.join(' ');

        return strippedDescription;
    };
    const toggleExpandDescription = (des) => {
        setFullDes(des)
        setCourseExpandedDescriptions(true);
    };

    const handleEnrollNow = (item) => {
        const id = item.id;
        const isSelected = cartCourses.some(cartItem => cartItem.plan && cartItem.plan.id === id); // Check if the item is already in the cart

        if (isSelected) {
            // Remove the item from the cart
            const updatedCartArray = cartCourses.filter(cartItem => !cartItem.plan || cartItem.plan.id !== id);
            setCartCourses(updatedCartArray);

            // Update localStorage with all cart items (both regular and drip courses)
            const allCartItems = localStorage.getItem('cartCourses');
            let fullCart = allCartItems ? JSON.parse(allCartItems) : [];
            fullCart = fullCart.filter(cartItem => !cartItem.plan || cartItem.plan.id !== id);
            localStorage.setItem("cartCourses", JSON.stringify(fullCart));
            // Dispatch custom event to notify other components
            window.dispatchEvent(new Event('cartUpdated'));

        } else {
            // Add the item to the cart
            const obj = {
                group: activeBtn,
                subject: selectSubjectWise,
                plan: item
            };
            const updatedCartArray = [...cartCourses, obj];
            setCartCourses(updatedCartArray);

            // Update localStorage with all cart items (both regular and drip courses)
            const allCartItems = localStorage.getItem('cartCourses');
            let fullCart = allCartItems ? JSON.parse(allCartItems) : [];
            // Remove any duplicate drip items and add the new one
            fullCart = fullCart.filter(cartItem => !cartItem.plan || cartItem.plan.id !== id);
            fullCart.push(obj);
            localStorage.setItem("cartCourses", JSON.stringify(fullCart));
            // Dispatch custom event to notify other components
            window.dispatchEvent(new Event('cartUpdated'));

        }
    };

    const handleFilter = (value) => {
        if (value === "group") {
            setSelectSubjectWise([])
            setActiveBtn(activeBtn)
        } else if (value === "subject") {
            setActiveBtn("both")
        }
        setFilterGroupSubject(value);
    }

    const handleButtonClick = (value) => {
        setSelectSubjectWise([]);
        setActiveStep(0);
        setActiveBtn(value);
        getPlans(value);
    }

    useEffect(() => {
        if (alltreeList?.length > 0) {
            // setActiveBtn('both')
            getPlans('both');
        }
    }, [alltreeList])

    useEffect(() => {
        getPlans(activeBtn);
    }, [selectSubjectWise, activeBtn])

    const fetchDripContent = async (scheduleId) => {
        try {
            let requestOptions = {
                // headers: { "X-Auth": token },
                withCredentials: false,
            };
            const response = await axios.get(BASE_URL + `/admin/content/fetch-drip-content/${scheduleId}`, requestOptions);

            if (response?.data?.errorCode === 0) {
                setAlltreeList(response?.data?.content)
                updateCartAndPurchaseArrays(response?.data?.content, cartCourses)
            };
        } catch (error) {
            console.log(error);
        }
    }

    const updateCartAndPurchaseArrays = (plansList, addedCartPlans) => {
        //     const matchedPlans = [];
        //     const newAddtoCartIds = [];
        let newPurchaseArray = [];

        addedCartPlans.forEach(cartItem => {
            plansList.forEach(plan => {
                if (cartItem.plan.title === plan.title) {
                    let object = getPlanPrice(plan, cartItem.group, cartItem.subject);
                    cartItem.plan = plan;
                    newPurchaseArray.push(cartItem);
                }
            })

        })
        setCartCourses(newPurchaseArray);
    };

    function getPlans(selectBtnType) {
        let plans = [];
        let subjectTempList = [];
        alltreeList.forEach((plan) => {
            if (selectBtnType === 'group1') {
                if (plan.children?.length > 0) {
                    plan.children.forEach((group) => {
                        if (group.title === 'Group 1') {
                            if (!checkPlansExists(plans, plan.title)) {
                                plans.push(plan);
                            }
                            if (group?.children?.length > 0) {
                                group.children.forEach((subject) => {
                                    if (!checkSubjectExists(subjectTempList, subject.title)) {
                                        subjectTempList.push(subject);
                                    }
                                })
                            }
                        }
                    })
                }
            }
            if (selectBtnType === 'group2') {
                if (plan.children?.length > 0) {
                    plan.children.forEach((group) => {
                        if (group.title === 'Group 2') {
                            if (!checkPlansExists(plans, plan.title)) {
                                plans.push(plan);
                            }
                            if (group?.children?.length > 0) {
                                group.children.forEach((subject) => {
                                    if (!checkSubjectExists(subjectTempList, subject.title)) {
                                        subjectTempList.push(subject);
                                    }
                                })
                            }
                        }
                    })
                }
            }
            if (selectBtnType === 'both') {
                if (plan.children?.length > 0) {
                    plan.children.forEach((group) => {
                        if (group.title === 'Group 2' || group.title === 'Group 1') {
                            if (!checkPlansExists(plans, plan.title)) {
                                plans.push(plan);
                            }
                            if (group?.children?.length > 0) {
                                group.children.forEach((subject) => {
                                    if (!checkSubjectExists(subjectTempList, subject.title)) {
                                        subjectTempList.push(subject);
                                    }
                                })
                            }
                        }
                    })
                }
            }
            if (selectSubjectWise.length > 0) {
                plans = filterPlansOnSelectedSubject(plans, selectSubjectWise);

            }
        })
        setSubjectWiseListRender(subjectTempList);
        setPlansList(plans);
    }

    function checkSubjectExists(subjectList, title) {

        let exists = false;
        subjectList.forEach((subject) => {
            if (subject.title === title) {
                exists = true;
            }
        })
        return exists;
    }
    function checkPlansExists(plansList, title) {

        let exists = false;
        plansList?.forEach((plan) => {
            if (plan.title === title) {
                exists = true;
            }
        })
        return exists;
    }

    function filterPlansOnSelectedSubject(plans, selectedSubjects) {
        let planList = [];
        plans?.forEach((plan) => {
            plan?.children?.forEach((group) => {
                group?.children?.forEach((subject) => {
                    selectedSubjects?.forEach((selectedSubject) => {
                        if (selectedSubject.title === subject.title && !checkPlansExists(planList, plan.title)) {
                            planList.push(plan);
                        }
                    })
                })
            })
        })
        return planList;
    }

    function filterSelectedSubjectListByGroup(group, sltSubject) {
        let selectedSubject = [];
        if (sltSubject?.length > 0) {
            sltSubject?.forEach((subject) => {
                if (group?.children?.length > 0) {
                    group?.children?.forEach((subjectGroup) => {
                        if (subject?.title === subjectGroup?.title) {
                            selectedSubject.push(subjectGroup);
                            // entityIdArrays.push({
                            //     purchaseType: "courseContent",
                            //     entityId: subjectGroup?.entityId
                            // })

                        }
                    })
                }

            })
        }
        return selectedSubject;
    }

    function filterSelectedSubjectListByPlan(plan, sltSubject) {
        let selectedSubject = [];
        if (sltSubject?.length > 0) {
            sltSubject?.forEach((subject) => {
                plan.children.forEach((group) => {
                    if (group?.children?.length > 0) {
                        group?.children?.forEach((subjectGroup) => {
                            if (subject?.title === subjectGroup?.title) {
                                selectedSubject.push(subjectGroup);
                            }
                        })
                    }
                })
            })
        }
        return selectedSubject;
    }

    function getPlanPrice(plan, selectedGroup, sltSubject) {
        let price = 0;
        // let discount = 0;
        let finalPrice = 0;
        let entityId = []
        let thumbLogo = ''
        if (selectedGroup === 'both') {
            let totalSubject = 0;
            let selectedSubject = filterSelectedSubjectListByPlan(plan, sltSubject);
            plan?.children.forEach((group) => {
                if (group?.children?.length > 0) {
                    group?.children.forEach((subject) => {
                        totalSubject += 1
                    })
                }
            })
            if (selectedSubject.length === totalSubject || selectedSubject.length === 0) {
                price = plan?.price;
                thumbLogo = plan?.description?.thumb;
                // discount = plan?.discount;
                finalPrice += plan?.price - ((plan?.price / 100) * plan?.discount);
                entityId.push({
                    purchaseType: "courseContent",
                    entityId: plan?.entityId
                })
            } else {
                plan?.children.forEach((group) => {
                    let allSubjectSelectOfGroup = false;
                    let groupSelectedSubject = 0;
                    let selectedOfGroup = [];
                    group?.children?.forEach((subject) => {
                        if (selectedSubject?.length > 0) {
                            selectedSubject.forEach((selectedSubject) => {
                                totalSubject += 1;
                                if (subject?.title === selectedSubject?.title) {
                                    selectedOfGroup.push(selectedSubject);
                                    groupSelectedSubject += 1;

                                    if (groupSelectedSubject === group?.children?.length) {
                                        allSubjectSelectOfGroup = true;
                                    }
                                }
                            })
                        }
                    })

                    if (allSubjectSelectOfGroup && groupSelectedSubject > 0) {
                        price += group?.price;
                        finalPrice += group?.price - ((group?.price / 100) * group?.discount);
                        thumbLogo = selectedOfGroup[0]?.description?.thumb;
                        // discount += selectedSubject?.discount;
                        entityId.push({
                            purchaseType: "courseContent",
                            entityId: group?.entityId
                        })
                    } else {
                        // thumbLogo = plan?.description?.thumb;
                        selectedOfGroup.forEach((selectedSubject) => {
                            price += selectedSubject?.price;
                            finalPrice += selectedSubject?.price - ((selectedSubject?.price / 100) * selectedSubject?.discount);
                            thumbLogo = selectedOfGroup[0]?.description?.thumb;
                            // discount += selectedSubject?.discount;
                            entityId.push({
                                purchaseType: "courseContent",
                                entityId: selectedSubject?.entityId
                            })
                        })
                    }
                })
            }

        }
        else if (selectedGroup === 'group1') {
            plan?.children.forEach((group) => {
                if (group?.title === 'Group 1') {
                    price = group?.price;
                    thumbLogo = group?.description?.thumb;
                    finalPrice += group?.price - ((group?.price / 100) * group?.discount);
                    // discount = group?.discount;
                    entityId.push({
                        purchaseType: "courseContent",
                        entityId: group?.entityId
                    })
                    let selectedSubject = filterSelectedSubjectListByGroup(group, sltSubject);
                    if (selectedSubject?.length > 0 && selectedSubject.length !== group.children.length) {
                        price = 0;
                        // discount = 0;
                        finalPrice = 0;
                        entityId = [];
                        selectedSubject.forEach((selectedSubject) => {
                            price += selectedSubject?.price;
                            // discount += selectedSubject?.discount;
                            finalPrice += selectedSubject?.price - ((selectedSubject?.price / 100) * selectedSubject?.discount);

                            entityId.push({
                                purchaseType: "courseContent",
                                entityId: selectedSubject?.entityId
                            })
                        })
                    }
                }
            })
        }

        else if (selectedGroup === 'group2') {
            plan?.children.forEach((group) => {
                if (group?.title === 'Group 2') {
                    price = group?.price;
                    thumbLogo = group?.description?.thumb;
                    finalPrice += group?.price - ((group?.price / 100) * group?.discount);
                    // discount = group?.discount;
                    entityId.push({
                        purchaseType: "courseContent",
                        entityId: group?.entityId
                    })
                    let selectedSubject = filterSelectedSubjectListByGroup(group, sltSubject);
                    if (selectedSubject?.length > 0 && selectedSubject.length !== group.children.length) {
                        price = 0;
                        // discount = 0;
                        entityId = [];
                        finalPrice = 0;
                        selectedSubject.forEach((selectedSubject) => {
                            price += selectedSubject?.price;
                            // discount += selectedSubject?.discount;
                            finalPrice += selectedSubject?.price - ((selectedSubject?.price / 100) * selectedSubject?.discount);

                            entityId.push({
                                purchaseType: "courseContent",
                                entityId: selectedSubject?.entityId
                            })
                        })
                    }
                }
            })
        }
        let discount = price - finalPrice;
        let percent = discount > 0 ? (((discount) / price) * 100).toFixed(2) : 0;

        return { "price": price, "finalPrice": finalPrice, "entityId": entityId, "thumbLogo": thumbLogo, "discount": discount, "percent": percent };

    }

    const chipTitle = (title) => {
        const first10Words = title
            .split(' ')
            .slice(0, 3)
            .join(' ');
        return first10Words;
    }

    const handleSelectSub = () => {
        setActiveBtn("both")
    }

    const handleSubjectWise = (event) => {
        const {
            target: { value },
        } = event;
        setSelectSubjectWise(typeof value === 'string' ? value.split(',') : value);
    };

    // const handleShowCart = () => {
    //     onQuizNavigation && onQuizNavigation('my-purchase');
    // }

    const isStepSkipped = (step) => {
        return skipped.has(step);
    };

    const totalSteps = () => {
        return steps.length;
    };

    const completedSteps = () => {
        return Object.keys(completed).length;
    };

    const isLastStep = () => {
        return activeStep === totalSteps() - 1;
    };

    const allStepsCompleted = () => {
        return completedSteps() === totalSteps();
    };

    const handleShowCart = () => {
        const newActiveStep = isLastStep() && !allStepsCompleted() ? steps.findIndex((step, i) => !(i in completed)) : activeStep + 1;

        setActiveStep(newActiveStep);
        window.scrollTo(0, 0)
    }

    const handleCheckoutSubmit = () => {
        const newActiveStep = isLastStep() && !allStepsCompleted() ? steps.findIndex((step, i) => !(i in completed)) : activeStep + 1;

        setActiveStep(newActiveStep);
        // getAllCoursesPublic()
        setOpenScheduleModal(false);
    }

    const handleRemoveItem = (item, i) => {
        let temp = [];
        cartCourses.forEach((item, x) => {
            if (x !== i) {
                temp.push(item)
            }
        })
        setCartCourses(temp);
        localStorage.setItem('cartArray', JSON.stringify(temp));
        if (temp?.length === 0) {
            setActiveStep(0)
        }
    }

    const handleBack = () => {
        setPeviewImgVideo({})
        setActiveStep((prevActiveStep) => prevActiveStep - 1);

    };

    const handleNumberChange = (e) => {
        const value = e.target.value;
        if (/^\d*$/.test(value) && value.length <= 10) {
            setNumber(value);
            setError('');
            if (value.length < 10) {
                setError('Number must be 10 digits long');
            }
        }
    };


    const handleCheckCoupon = async (e) => {
        e.preventDefault();
        const body = {
            "getCheckoutUrls": purchaseArray,
            "coupon": couponNumber,
            "contact": Number(number),
            "instId": instId,
            "amount": checked ? (orderBumpCourse.price - ((orderBumpCourse.price / 100) * orderBumpCourse.discount)) + totalPrice : (totalPrice)
        }
        try {
            const response = await axios.post(BASE_URL + `/student/coupon/verify`, body);
            // const response = await CourseNetwrok.checkCouponApi(body);
            if (response.data.errorCode === 0) {
                setCouponDiscount(response.data?.discount);
                setIsCouponValid(response.data?.valid);
                setErrorMessage("");
            } else {
                setIsCouponValid(response.data?.valid === null ? false : response.data?.valid);
                setErrorMessage(response.data?.message ? response.data?.message : "Invalid Coupon Code");
                setCouponDiscount(0)
                // setErrorMessage("Invalid Coupon Code")
            }
        } catch (err) {
            console.log(err);
        };
    };

    const handleCoupon = (e) => {
        setCouponNumber(e.target.value);
        setErrorMessage('');
        setIsCouponValid(null);
    }

    const getColor = () => {
        if (isCouponValid === null) return 'darkblue';
        return isCouponValid ? '#329908' : 'red';
    };

    const handleReedemCode = () => {
        setReedemCode(!reedemCode)
    }

    const handleSubmit = async () => {
        const body = {
            "firstName": title,
            "lastName": title,
            "contact": number,
            "email": email,
            "campaignId": null,
            "instId": instId,
            "entityModals": purchaseArray,
            "coupon": isCouponValid === true ? couponNumber : null
        }
        try {
            const response = await axios.post(BASE_URL + `/admin/payment/fetch-public-checkout-url`, body);

            if (response?.data?.status === true) {

                const width = 480;
                const height = 1080;
                const left = window.screenX + (window.outerWidth / 2) - (width / 2);
                const top = window.screenY + (window.outerHeight / 2) - (height / 2);

                window.open(
                    response?.data?.url,
                    'sharer',
                    `location=no,width=${width},height=${height},top=${top},left=${left}`
                );

                // window.open(response?.data?.url, '_blank', "noopener,noreferrer");
                // window.open(response?.data?.url, 'sharer', "location=no,width=480,height=1080");

                setTitle('');
                setNumber('');
                setEmail('')
                setCartArray([])
                // localStorage.removeItem('cartArray')
                localStorage.setItem("cartArray", JSON.stringify([]));

                // handleDrawerClose()
            }
            const newActiveStep = isLastStep() && !allStepsCompleted() ? steps.findIndex((step, i) => !(i in completed)) : activeStep + 1;
            setActiveStep(newActiveStep);
        } catch (err) {
            console.log(err);
        };
    };

    const handleSubjectButtonClick = (item) => {
        setSelectSubjectWise((prev) => {
            const alreadySelected = prev.some(sub => sub.id === item.id);
            if (alreadySelected) {
                return prev.filter(sub => sub.id !== item.id);
            } else {
                return [...prev, item];
            }
        });
    };

    const handleRemoveSubject = (item) => {
        setSelectSubjectWise((prev) => prev.filter(sub => sub.id !== item.id));
    };

    return (
        <>
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-4 md:p-6 lg:p-8">
                <div className="max-w-7xl mx-auto">
                    {/* Modern Header with gradient */}
                    {/* <div className="mb-8 md:mb-12">
                        <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 mb-2">
                            Course Store
                        </h1>
                        <p className="text-base md:text-lg text-gray-600 max-w-2xl">
                            Expand your skills with our premium courses and learning materials
                        </p>
                    </div> */}
                    {
                        activeStep > 0 && (
                            <Box sx={{ display: 'flex', flexDirection: 'row', pb: 2, mt: 3 }}>
                                <Button
                                    color="inherit"
                                    onClick={handleBack}
                                    startIcon={<ArrowBackIcon />}
                                    sx={{
                                        mr: 1,
                                        fontWeight: "600",
                                        fontSize: "14px",
                                        textTransform: "none",
                                        borderRadius: "8px",
                                        px: 3,
                                        border: "1px solid rgba(102, 126, 234, 0.2)",
                                        color: "#667eea",
                                        '&:hover': {
                                            background: 'rgba(102, 126, 234, 0.1)',
                                            borderColor: "#667eea",
                                        }
                                    }}
                                >
                                    Back
                                </Button>
                                <Box sx={{ flex: '1 1 auto' }} />
                            </Box>
                        )
                    }
                    {
                        activeStep === 0 && (
                            <>
                                <Box sx={{ mb: 2 }} className="filter-btn">
                                    <Button
                                        onClick={() => handleFilter('group')}
                                        sx={{
                                            background: filterGroupSubject === "group"
                                                ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                                                : "transparent",
                                            color: filterGroupSubject === "group" ? "#fff" : "#667eea",
                                            fontWeight: "700",
                                            marginRight: { xs: '8px', sm: '16px' },
                                            border: "1px solid rgba(102, 126, 234, 0.3)",
                                            fontSize: { xs: "11px", sm: "12px" },
                                            padding: { xs: "10px 12px", sm: "12px 16px" },
                                            borderRadius: "10px",
                                            textTransform: "none",
                                            boxShadow: filterGroupSubject === "group"
                                                ? '0 4px 15px 0 rgba(102, 126, 234, 0.4)'
                                                : 'none',
                                            transition: 'all 0.3s ease',
                                            '&:hover': {
                                                background: filterGroupSubject === "group"
                                                    ? "linear-gradient(135deg, #764ba2 0%, #667eea 100%)"
                                                    : "rgba(102, 126, 234, 0.1)",
                                                transform: 'translateY(-2px)',
                                                boxShadow: '0 6px 20px 0 rgba(102, 126, 234, 0.3)',
                                            },
                                        }}
                                        className='mobile-group-btn'
                                    >
                                        Groups Wise
                                    </Button>
                                    <Button
                                        onClick={() => handleFilter('subject')}
                                        sx={{
                                            background: filterGroupSubject === "subject"
                                                ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                                                : "transparent",
                                            color: filterGroupSubject === "subject" ? "#fff" : "#667eea",
                                            fontWeight: "700",
                                            marginRight: { xs: '8px', sm: '16px' },
                                            border: "1px solid rgba(102, 126, 234, 0.3)",
                                            fontSize: { xs: "11px", sm: "12px" },
                                            padding: { xs: "10px 12px", sm: "12px 16px" },
                                            borderRadius: "10px",
                                            textTransform: "none",
                                            boxShadow: filterGroupSubject === "subject"
                                                ? '0 4px 15px 0 rgba(102, 126, 234, 0.4)'
                                                : 'none',
                                            transition: 'all 0.3s ease',
                                            '&:hover': {
                                                background: filterGroupSubject === "subject"
                                                    ? "linear-gradient(135deg, #764ba2 0%, #667eea 100%)"
                                                    : "rgba(102, 126, 234, 0.1)",
                                                transform: 'translateY(-2px)',
                                                boxShadow: '0 6px 20px 0 rgba(102, 126, 234, 0.3)',
                                            },
                                        }}
                                        className='mobile-group-btn'
                                    >
                                        Subjects Wise
                                    </Button>
                                    {/* {
                            filterGroupSubject === "subject" && (
                                <FormControl className='mobile-select-button' sx={{ marginRight: '16px', marginTop: !isMobileDevice ? "20px" : "" }} >
                                    <InputLabel id="demo-simple-select-label" sx={{ fontSize: "13px" }}>Subject Wise</InputLabel>
                                    <Select
                                        defaultOpen={true}
                                        onOpen={handleSelectSub}
                                        sx={{ minWidth: "100px", maxWidth: "300px", width: "200px", fontSize: "12px" }}
                                        labelId='channel-lable'
                                        className='select-option'
                                        multiple
                                        value={selectSubjectWise}
                                        onChange={handleSubjectWise}
                                        renderValue={(selected) => selected?.map((x) => x?.title).join(', ')}
                                        // renderValue={(selected) => (selected.title).join(', ')}
                                        // MenuProps={MenuProps}
                                        label="Subject Wise"
                                    >
                                        {
                                            subjectWiseListRender && subjectWiseListRender
                                                .filter(item => item.title === item.title)
                                                .map((item, index) => {
                                                    return (
                                                        <MenuItem key={index} value={item}>
                                                            <Checkbox checked={selectSubjectWise.indexOf(item) > -1} />
                                                            <ListItemText primary={item?.title} />
                                                        </MenuItem>
                                                    );
                                                })
                                        }
                                    </Select>
                                </FormControl>
                            )
                        } */}
                                </Box>
                                {
                                    filterGroupSubject === "group" && (
                                        <Box className="mobile-filter-btn" sx={{ display: "flex", flexWrap: "wrap", gap: { xs: 1, sm: 2 } }}>
                                            <Button
                                                onClick={() => handleButtonClick('both')}
                                                sx={{
                                                    background: activeBtn === "both"
                                                        ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                                                        : "transparent",
                                                    color: activeBtn === "both" ? "#fff" : "#667eea",
                                                    fontWeight: "700",
                                                    padding: { xs: "10px 14px", sm: "12px 16px" },
                                                    border: "1px solid rgba(102, 126, 234, 0.3)",
                                                    fontSize: { xs: "11px", sm: "12px" },
                                                    minWidth: { xs: "100px", sm: "110px" },
                                                    borderRadius: "10px",
                                                    textTransform: "none",
                                                    boxShadow: activeBtn === "both"
                                                        ? '0 4px 15px 0 rgba(102, 126, 234, 0.4)'
                                                        : 'none',
                                                    transition: 'all 0.3s ease',
                                                    '&:hover': {
                                                        background: activeBtn === "both"
                                                            ? "linear-gradient(135deg, #764ba2 0%, #667eea 100%)"
                                                            : "rgba(102, 126, 234, 0.1)",
                                                        transform: 'translateY(-2px)',
                                                        boxShadow: '0 6px 20px 0 rgba(102, 126, 234, 0.3)',
                                                    },
                                                }}
                                                className='mobile-group-btn'
                                            >
                                                Both Group
                                            </Button>
                                            <Button
                                                onClick={() => handleButtonClick('group1')}
                                                sx={{
                                                    background: activeBtn === "group1"
                                                        ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                                                        : "transparent",
                                                    color: activeBtn === "group1" ? "#fff" : "#667eea",
                                                    fontWeight: "700",
                                                    padding: { xs: "10px 14px", sm: "12px 16px" },
                                                    border: "1px solid rgba(102, 126, 234, 0.3)",
                                                    fontSize: { xs: "11px", sm: "12px" },
                                                    minWidth: { xs: "100px", sm: "110px" },
                                                    borderRadius: "10px",
                                                    textTransform: "none",
                                                    boxShadow: activeBtn === "group1"
                                                        ? '0 4px 15px 0 rgba(102, 126, 234, 0.4)'
                                                        : 'none',
                                                    transition: 'all 0.3s ease',
                                                    '&:hover': {
                                                        background: activeBtn === "group1"
                                                            ? "linear-gradient(135deg, #764ba2 0%, #667eea 100%)"
                                                            : "rgba(102, 126, 234, 0.1)",
                                                        transform: 'translateY(-2px)',
                                                        boxShadow: '0 6px 20px 0 rgba(102, 126, 234, 0.3)',
                                                    },
                                                }}
                                                className='mobile-group-btn'
                                            >
                                                Group 1
                                            </Button>
                                            <Button
                                                onClick={() => handleButtonClick('group2')}
                                                sx={{
                                                    background: activeBtn === "group2"
                                                        ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                                                        : "transparent",
                                                    color: activeBtn === "group2" ? "#fff" : "#667eea",
                                                    fontWeight: "700",
                                                    padding: { xs: "10px 14px", sm: "12px 16px" },
                                                    border: "1px solid rgba(102, 126, 234, 0.3)",
                                                    fontSize: { xs: "11px", sm: "12px" },
                                                    minWidth: { xs: "100px", sm: "110px" },
                                                    borderRadius: "10px",
                                                    textTransform: "none",
                                                    boxShadow: activeBtn === "group2"
                                                        ? '0 4px 15px 0 rgba(102, 126, 234, 0.4)'
                                                        : 'none',
                                                    transition: 'all 0.3s ease',
                                                    '&:hover': {
                                                        background: activeBtn === "group2"
                                                            ? "linear-gradient(135deg, #764ba2 0%, #667eea 100%)"
                                                            : "rgba(102, 126, 234, 0.1)",
                                                        transform: 'translateY(-2px)',
                                                        boxShadow: '0 6px 20px 0 rgba(102, 126, 234, 0.3)',
                                                    },
                                                }}
                                                className='mobile-group-btn'
                                            >
                                                Group 2
                                            </Button>
                                        </Box>
                                    )
                                }
                                {
                                    filterGroupSubject === "subject" && subjectWiseListRender?.map((item, index) => {
                                        const isSelected = selectSubjectWise.some(sub => sub.id === item.id);
                                        return (
                                            <Box
                                                key={index}
                                                sx={{
                                                    position: "relative",
                                                    display: "inline-block",
                                                    marginRight: { xs: '8px', sm: '12px' },
                                                    mb: !isMobile ? 1 : 0,
                                                }}
                                            >
                                                <Button
                                                    variant={isSelected ? "contained" : "outlined"}
                                                    size="small"
                                                    onClick={() => handleSubjectButtonClick(item)}
                                                    sx={{
                                                        textTransform: "none",
                                                        fontSize: { xs: "11px", sm: "12px" },
                                                        fontWeight: "600",
                                                        borderRadius: "20px",
                                                        padding: { xs: "4px 16px", sm: "6px 20px" },
                                                        minHeight: { xs: "32px", sm: "36px" },
                                                        background: isSelected
                                                            ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                                                            : "transparent",
                                                        borderColor: isSelected ? "transparent" : "rgba(102, 126, 234, 0.3)",
                                                        color: isSelected ? "#fff" : "#667eea",
                                                        boxShadow: isSelected
                                                            ? '0 4px 12px 0 rgba(102, 126, 234, 0.4)'
                                                            : 'none',
                                                        transition: 'all 0.3s ease',
                                                        paddingRight: isSelected ? { xs: "28px", sm: "32px" } : { xs: "16px", sm: "20px" },
                                                        '&:hover': {
                                                            background: isSelected
                                                                ? "linear-gradient(135deg, #764ba2 0%, #667eea 100%)"
                                                                : "rgba(102, 126, 234, 0.1)",
                                                            borderColor: isSelected ? "transparent" : "#667eea",
                                                            transform: 'translateY(-2px)',
                                                            boxShadow: '0 6px 16px 0 rgba(102, 126, 234, 0.3)',
                                                        },
                                                    }}
                                                >
                                                    {item.title}
                                                </Button>

                                                {isSelected && (
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => handleRemoveSubject(item)}
                                                        sx={{
                                                            position: "absolute",
                                                            top: -6,
                                                            right: -6,
                                                            background: "#fff",
                                                            border: "1px solid #ef4444",
                                                            width: { xs: 18, sm: 20 },
                                                            height: { xs: 18, sm: 20 },
                                                            p: 0,
                                                            boxShadow: '0 2px 8px rgba(239, 68, 68, 0.2)',
                                                            transition: 'all 0.2s ease',
                                                            zIndex: 1,
                                                            "&:hover": {
                                                                backgroundColor: "#fef2f2",
                                                                borderColor: "#dc2626",
                                                                transform: 'scale(1.1)',
                                                            },
                                                        }}
                                                    >
                                                        <CloseIcon sx={{ fontSize: { xs: 10, sm: 12 }, color: "#ef4444" }} />
                                                    </IconButton>
                                                )}
                                            </Box>
                                        );
                                    })
                                }
                            </>)
                    }
                    <Grid item xs={12} sm={8} md={8} lg={8} sx={{ mb: 2, display: "none" }}>
                        <Stepper activeStep={activeStep}>
                            {steps.map((label, index) => {
                                const stepProps = {};
                                const labelProps = {};
                                if (isStepSkipped(index)) {
                                    stepProps.completed = false;
                                }
                                return (
                                    <Step key={label} {...stepProps}>
                                        <StepLabel {...labelProps} StepIconComponent={QontoStepIcon}>
                                            <Typography variant='p' fontWeight={'bold'} sx={{ fontSize: "14px" }}>{label}</Typography>
                                        </StepLabel>
                                    </Step>
                                );
                            })}
                        </Stepper>
                    </Grid>
                    {
                        activeStep === 0 && (
                            <>
                                <Grid item xs={12} sm={2} md={2} lg={2} sx={{ paddingLeft: !isMobile ? "0px !important" : "", paddingTop: !isMobile ? "0px !important" : "" }}>
                                    {cartCourses?.length > 0 && (<Box sx={{ width: "100%", mb: 3, textAlign: "end", mt: !isMobile ? 2 : 0 }}>
                                        <Button
                                            disabled={cartCourses?.length > 0 ? false : true}
                                            onClick={handleShowCart}
                                            startIcon={<ArrowForwardIcon />}
                                            sx={{
                                                fontWeight: "bold",
                                                fontSize: "12px",
                                                textTransform: "none",
                                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                                color: '#fff',
                                                padding: { xs: "10px 14px", sm: "8px 12px" },
                                                borderRadius: '12px',
                                                boxShadow: '0 4px 15px 0 rgba(102, 126, 234, 0.4)',
                                                transition: 'all 0.3s ease',
                                                '&:hover': {
                                                    background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
                                                    boxShadow: '0 6px 20px 0 rgba(102, 126, 234, 0.6)',
                                                    transform: 'translateY(-2px)',
                                                },
                                                '&.Mui-disabled': {
                                                    background: 'rgba(0, 0, 0, 0.12)',
                                                    color: 'rgba(0, 0, 0, 0.26)',
                                                }
                                            }}
                                        >
                                            Go to Cart Details
                                        </Button>
                                    </Box>)}
                                </Grid>

                                {/* Courses Header with Counter */}
                                {plansList && plansList.length > 0 && (
                                    <div className="flex items-center justify-between mb-6">

                                        {plansList.length > 6 && (
                                            <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                                                {showAllCourses ? plansList.length : 6} of {plansList.length} courses
                                            </span>
                                        )}
                                    </div>
                                )}

                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4">
                                    {
                                        plansList && (showAllCourses ? plansList : plansList.slice(0, 6)).map((item, i) => {

                                            let object = getPlanPrice(item, activeBtn, selectSubjectWise);

                                            let logo = object?.thumbLogo;
                                            let price = object?.price;
                                            let finalPrices = object?.finalPrice === 0 ? Number(price) - (Number(price / 100) * Number(item?.discount)) : object?.finalPrice;
                                            let discount = 100 - ((finalPrices / price) * 100)
                                            const fullDescription = item?.description?.description || "";
                                            return <Grid item xs={12} sm={2.4} md={2.4} lg={2.4} sx={{ padding: { xs: "8px", sm: "10px" }, textAlign: "center", }} key={i}>
                                                <div className="group bg-white rounded-lg shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-blue-200 transform hover:-translate-y-1">

                                                    {/* Course Image with Overlay */}
                                                    <div className="relative h-32 md:h-36 overflow-hidden bg-gradient-to-br from-blue-100 to-purple-100">
                                                        <img
                                                            src={filterGroupSubject === "subject" ? Endpoints?.mediaBaseUrl + subjectWiseListRender[0]?.description?.thumb : object?.thumbLogo ? Endpoints?.mediaBaseUrl + logo : "img/folder-2.png"}
                                                            alt={item.title}
                                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                                        />
                                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                                    </div>

                                                    {/* Course Content */}
                                                    <Box sx={{ p: { xs: 2, sm: 2.5 } }}>
                                                        <h3 className="text-sm md:text-base font-bold text-gray-900 mb-1.5 line-clamp-2 min-h-[2rem] group-hover:text-blue-600 transition-colors">
                                                            {item.title}
                                                        </h3>
                                                        <p className="text-gray-600 text-xs mb-2 line-clamp-2 leading-relaxed">
                                                            {setCourseExpandedDescriptions === false ? truncateDescription(fullDescription) : truncateDescription(fullDescription)}
                                                            {fullDescription.length > 100 && (
                                                                <button
                                                                    onClick={() => toggleExpandDescription(fullDescription)}
                                                                    className="text-blue-600 hover:text-blue-700 font-medium ml-1 underline"
                                                                >
                                                                    more
                                                                </button>
                                                            )}
                                                        </p>

                                                        {/* Subject Chips */}
                                                        {selectSubjectWise?.length > 0 && (
                                                            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, mb: 1.5 }}>
                                                                {selectSubjectWise?.map((chipLebel, i) => (
                                                                    <Chip
                                                                        size="small"
                                                                        label={chipTitle(chipLebel?.title)}
                                                                        variant="outlined"
                                                                        key={i}
                                                                        sx={{
                                                                            backgroundColor: "rgba(102, 126, 234, 0.1)",
                                                                            color: "#667eea",
                                                                            fontWeight: "600",
                                                                            borderColor: "rgba(102, 126, 234, 0.3)",
                                                                            fontSize: "10px",
                                                                            height: "20px",
                                                                        }}
                                                                    />
                                                                ))}
                                                            </Box>
                                                        )}

                                                        {/* Pricing Section */}
                                                        <div className="mb-2">
                                                            {item.paid ? (
                                                                object.percent > 0 ? (
                                                                    <div className="flex items-baseline gap-1 justify-center flex-wrap">
                                                                        <span className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                                                                            ₹{object?.finalPrice.toFixed(2)}
                                                                        </span>
                                                                        <span className="text-xs text-gray-400 line-through">
                                                                            ₹{price.toFixed(2)}
                                                                        </span>
                                                                        <span className="text-xs font-semibold text-green-600 bg-green-50 px-1.5 py-0.5 rounded-full">
                                                                            {parseFloat(object.percent).toFixed(0)}% off
                                                                        </span>
                                                                    </div>
                                                                ) : (
                                                                    <div className="flex items-baseline gap-1 justify-center">
                                                                        <span className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                                                                            ₹{object?.finalPrice.toFixed(2)}
                                                                        </span>
                                                                    </div>
                                                                )
                                                            ) : (
                                                                <span className="text-lg font-bold text-green-600">Free</span>
                                                            )}
                                                        </div>

                                                        {/* Course Action Button */}
                                                        <button
                                                            onClick={() => handleEnrollNow(item)}
                                                            className={`w-full font-semibold py-1.5 px-2 text-xs rounded-lg transition-all duration-300 flex items-center justify-center gap-1.5 shadow-lg transform hover:scale-105 ${cartCourses.some(cartItem => cartItem.plan.id === item.id)
                                                                ? 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white hover:shadow-red-500/50'
                                                                : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white hover:shadow-blue-500/50'
                                                                }`}
                                                        >
                                                            {cartCourses.some(cartItem => cartItem.plan.id === item.id) ? (
                                                                <>
                                                                    <span className="text-xs">🗑️</span>
                                                                    Remove
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <ShoppingCart className="h-3.5 w-3.5" />
                                                                    Add to Cart
                                                                </>
                                                            )}
                                                        </button>
                                                    </Box>
                                                </div>
                                            </Grid>
                                        })
                                    }
                                </div>

                                {/* View More Button for Courses */}
                                {plansList && plansList.length > 6 && (
                                    <div className="flex justify-center mt-8 md:mt-12">
                                        <button
                                            onClick={() => setShowAllCourses(!showAllCourses)}
                                            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-3 px-8 rounded-xl transition-all duration-300 flex items-center gap-3 shadow-lg hover:shadow-purple-500/50 transform hover:scale-105"
                                        >
                                            {showAllCourses ? (
                                                <>
                                                    <span>Show Less</span>
                                                    <svg className="w-5 h-5 transform rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                    </svg>
                                                </>
                                            ) : (
                                                <>
                                                    <span>View More Courses ({plansList.length - 6} more)</span>
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                    </svg>
                                                </>
                                            )}
                                        </button>
                                    </div>
                                )}
                            </>
                        )}
                    {
                        activeStep === 1 && (
                            <Box sx={{ mt: 3, mb: 3 }}>
                                {/* Modern Cart Header */}
                                <Box sx={{ mb: 4 }}>
                                    <Typography
                                        variant="h5"
                                        sx={{
                                            fontWeight: 700,
                                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                            WebkitBackgroundClip: 'text',
                                            WebkitTextFillColor: 'transparent',
                                            mb: 1,
                                            textAlign: 'center'
                                        }}
                                    >
                                        Your Cart Details
                                    </Typography>
                                    <Typography
                                        variant="body1"
                                        sx={{
                                            color: '#6b7280',
                                            textAlign: 'center',
                                            maxWidth: '600px',
                                            mx: 'auto'
                                        }}
                                    >
                                        Review your selected courses before proceeding to checkout
                                    </Typography>
                                </Box>

                                <Grid container spacing={3}>
                                    <Grid item xs={12} lg={8}>
                                        <Paper
                                            elevation={0}
                                            sx={{
                                                borderRadius: '16px',
                                                border: '1px solid rgba(102, 126, 234, 0.1)',
                                                overflow: 'hidden',
                                                background: '#fff',
                                            }}
                                        >
                                            {
                                                cartCourses?.length > 0 && cartCourses?.map((item, i) => {

                                                    let object = getPlanPrice(item.plan, item.group, item.subject);
                                                    let subjects = item.subject;
                                                    let logo = object?.thumbLogo
                                                    let price = object?.price;
                                                    let finalPrices = object?.finalPrice === 0 ? Number(price) - (Number(price / 100) * Number(item?.plan?.discount)) : object?.finalPrice;
                                                    let discount = 100 - ((finalPrices / price) * 100)

                                                    let details = item.plan;
                                                    const preview = peviewImgVideo[details.id];
                                                    const newDiscount = details.discount || 0;
                                                    const newPrice = details.price || 0;
                                                    const totalPrice = 0;
                                                    const fullDescription = details?.description?.description || "";

                                                    return (
                                                        <Box
                                                            key={i}
                                                            sx={{
                                                                p: 3,
                                                                borderBottom: i !== cartCourses.length - 1 ? '1px solid rgba(102, 126, 234, 0.1)' : 'none',
                                                                '&:hover': {
                                                                    background: 'rgba(102, 126, 234, 0.02)'
                                                                }
                                                            }}
                                                        >
                                                            <Grid container spacing={3} alignItems="center">
                                                                {/* Course Image */}
                                                                <Grid item xs={12} sm={3}>
                                                                    <Box sx={{ position: 'relative' }}>
                                                                        <Box
                                                                            sx={{
                                                                                borderRadius: '12px',
                                                                                overflow: 'hidden',
                                                                                aspectRatio: '16/9',
                                                                                background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
                                                                                display: 'flex',
                                                                                alignItems: 'center',
                                                                                justifyContent: 'center'
                                                                            }}
                                                                        >
                                                                            <img
                                                                                src={subjects?.length > 0 ? Endpoints?.mediaBaseUrl + subjects[0]?.description?.thumb : logo ? Endpoints?.mediaBaseUrl + logo : 'img/folder-2.png'}
                                                                                alt="Course"
                                                                                style={{
                                                                                    width: '100%',
                                                                                    height: '100%',
                                                                                    objectFit: 'cover'
                                                                                }}
                                                                            />
                                                                        </Box>

                                                                        {/* Video Preview if available */}
                                                                        {/* {details?.description?.video && (
                                                                            <Box sx={{ mt: 1 }}>
                                                                                <video 
                                                                                    controls 
                                                                                    src={Endpoints?.mediaBaseUrl + details?.description?.video} 
                                                                                    style={{ 
                                                                                        width: "100%", 
                                                                                        borderRadius: '8px',
                                                                                        maxHeight: "120px" 
                                                                                    }} 
                                                                                    onClick={() => handlePreview && handlePreview(details?.description?.video, 'video', details.id)} 
                                                                                />
                                                                            </Box>
                                                                        )} */}
                                                                    </Box>
                                                                </Grid>

                                                                {/* Course Details */}
                                                                <Grid item xs={12} sm={6}>
                                                                    <Typography
                                                                        variant="h6"
                                                                        sx={{
                                                                            fontWeight: 700,
                                                                            color: '#1f2937',
                                                                            mb: 1,
                                                                            lineHeight: 1.3
                                                                        }}
                                                                    >
                                                                        {details?.title}
                                                                    </Typography>

                                                                    {/* Subject Chips */}
                                                                    {item.subject?.length > 0 && (
                                                                        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, mb: 2 }}>
                                                                            {item.subject?.map((chipLabel, chipIndex) => (
                                                                                <Chip
                                                                                    key={chipIndex}
                                                                                    size="small"
                                                                                    label={chipTitle(chipLabel?.title)}
                                                                                    variant="outlined"
                                                                                    sx={{
                                                                                        backgroundColor: "rgba(102, 126, 234, 0.1)",
                                                                                        color: "#667eea",
                                                                                        fontWeight: "600",
                                                                                        borderColor: "rgba(102, 126, 234, 0.3)",
                                                                                        fontSize: "11px",
                                                                                    }}
                                                                                />
                                                                            ))}
                                                                        </Box>
                                                                    )}

                                                                    {/* Description */}
                                                                    <Typography
                                                                        variant="body2"
                                                                        sx={{
                                                                            color: '#6b7280',
                                                                            mb: 2,
                                                                            display: { xs: 'block', sm: 'none' }
                                                                        }}
                                                                        className='mobile-view-discrip'
                                                                    >
                                                                        {truncateDescription(fullDescription)}
                                                                        {fullDescription.length > 100 && (
                                                                            <Button
                                                                                size="small"
                                                                                onClick={() => toggleExpandDescription(fullDescription)}
                                                                                sx={{
                                                                                    color: '#667eea',
                                                                                    textDecoration: 'underline',
                                                                                    p: 0,
                                                                                    minWidth: 'auto',
                                                                                    fontSize: 'inherit'
                                                                                }}
                                                                            >
                                                                                more
                                                                            </Button>
                                                                        )}
                                                                    </Typography>

                                                                    <Box sx={{ display: { xs: 'none', sm: 'block' } }} className='desktop-view-discrip'>
                                                                        <Typography variant="body2" sx={{ color: '#6b7280' }}>
                                                                            {details?.description?.description ? parse(details?.description?.description) : ""}
                                                                        </Typography>
                                                                    </Box>
                                                                </Grid>

                                                                {/* Price and Actions */}
                                                                <Grid item xs={12} sm={3}>
                                                                    <Box sx={{ textAlign: { xs: 'left', sm: 'center' } }}>
                                                                        {/* Price Display */}
                                                                        {details?.paid ? (
                                                                            <Box>
                                                                                {discount > 0 ? (
                                                                                    <Typography
                                                                                        variant="h6"
                                                                                        sx={{
                                                                                            fontWeight: 700,
                                                                                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                                                                            WebkitBackgroundClip: 'text',
                                                                                            WebkitTextFillColor: 'transparent',
                                                                                            mb: 0.5
                                                                                        }}
                                                                                    >
                                                                                        ₹{object?.finalPrice.toFixed(2)}
                                                                                    </Typography>
                                                                                ) : (
                                                                                    <Typography
                                                                                        variant="h6"
                                                                                        sx={{
                                                                                            fontWeight: 700,
                                                                                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                                                                            WebkitBackgroundClip: 'text',
                                                                                            WebkitTextFillColor: 'transparent'
                                                                                        }}
                                                                                    >
                                                                                        ₹{price.toFixed(2)}
                                                                                    </Typography>
                                                                                )}
                                                                            </Box>
                                                                        ) : (
                                                                            <Typography
                                                                                variant="h5"
                                                                                sx={{
                                                                                    fontWeight: 700,
                                                                                    color: '#10b981',
                                                                                    mb: 2
                                                                                }}
                                                                            >
                                                                                Free
                                                                            </Typography>
                                                                        )}

                                                                        {/* Remove Button */}
                                                                        <Button
                                                                            onClick={() => handleRemoveItem(item, i)}
                                                                            variant="outlined"
                                                                            size="small"
                                                                            sx={{
                                                                                mt: 1,
                                                                                color: '#ef4444',
                                                                                borderColor: '#ef4444',
                                                                                textTransform: 'none',
                                                                                fontSize: '12px',
                                                                                '&:hover': {
                                                                                    borderColor: '#dc2626',
                                                                                    backgroundColor: 'rgba(239, 68, 68, 0.04)'
                                                                                }
                                                                            }}
                                                                        >
                                                                            Remove from Cart
                                                                        </Button>
                                                                    </Box>
                                                                </Grid>
                                                            </Grid>
                                                        </Box>
                                                    );
                                                })
                                            }
                                        </Paper>
                                    </Grid>

                                    {/* Order Summary Sidebar */}
                                    <Grid item xs={12} lg={4}>
                                        <Box sx={{ position: { lg: 'sticky' }, top: { lg: '100px' } }}>
                                            <Paper
                                                elevation={0}
                                                sx={{
                                                    p: 3,
                                                    borderRadius: '16px',
                                                    border: '1px solid rgba(102, 126, 234, 0.1)',
                                                    background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.02) 0%, rgba(118, 75, 162, 0.02) 100%)',
                                                }}
                                            >
                                                <Typography
                                                    variant="h6"
                                                    sx={{
                                                        fontWeight: 700,
                                                        color: '#1f2937',
                                                        mb: 3,
                                                        textAlign: 'center'
                                                    }}
                                                >
                                                    Order Summary
                                                </Typography>

                                                <Box sx={{
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    alignItems: 'center',
                                                    mb: 3,
                                                    p: 2,
                                                    borderRadius: '12px',
                                                    background: '#fff'
                                                }}>
                                                    <Typography variant="p" sx={{ fontWeight: 600 }}>
                                                        Total Amount
                                                    </Typography>
                                                    <Typography
                                                        variant="h6"
                                                        sx={{
                                                            fontWeight: 700,
                                                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                                            WebkitBackgroundClip: 'text',
                                                            WebkitTextFillColor: 'transparent',
                                                        }}
                                                    >
                                                        ₹{totalPrice.toFixed(2)}
                                                    </Typography>
                                                </Box>
                                            </Paper>
                                        </Box>
                                    </Grid>
                                </Grid>

                                {/* Modern Checkout Button */}
                                <Box sx={{ mt: 4, textAlign: 'center' }}>
                                    <Button
                                        onClick={handleCheckoutSubmit}
                                        variant="contained"
                                        size="large"
                                        sx={{
                                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                            color: '#fff',
                                            fontWeight: 700,
                                            fontSize: { xs: '14px', sm: '12px' },
                                            // px: { xs: 4 },
                                            // py: { xs: 1.5, sm: 2 },
                                            borderRadius: '12px',
                                            textTransform: 'none',
                                            boxShadow: '0 8px 25px 0 rgba(102, 126, 234, 0.4)',
                                            position: { xs: 'fixed', sm: 'static' },
                                            bottom: { xs: '20px', sm: 'auto' },
                                            left: { xs: '50%', sm: 'auto' },
                                            transform: { xs: 'translateX(-50%)', sm: 'none' },
                                            zIndex: { xs: 1000, sm: 'auto' },
                                            minWidth: { xs: '280px', sm: 'auto' },
                                            transition: 'all 0.3s ease',
                                            '&:hover': {
                                                background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
                                                boxShadow: '0 12px 35px 0 rgba(102, 126, 234, 0.6)',
                                                transform: {
                                                    xs: 'translateX(-50%) translateY(-4px)',
                                                    sm: 'translateY(-4px)'
                                                },
                                            },
                                        }}
                                    >
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <Typography sx={{ fontWeight: 700, fontSize: 'inherit' }}>
                                                Proceed to Checkout
                                            </Typography>
                                            <Box
                                                sx={{
                                                    background: 'rgba(255, 255, 255, 0.2)',
                                                    borderRadius: '8px',
                                                    px: 1.5,
                                                    py: 0.5,
                                                    fontSize: '12px'
                                                }}
                                            >
                                                ₹{totalPrice.toFixed(2)}
                                            </Box>
                                        </Box>
                                    </Button>
                                </Box>
                            </Box>
                        )
                    }
                    {
                        activeStep === 2 && (
                            <Box sx={{ mt: 4, mb: 4 }}>
                                <Paper
                                    elevation={0}
                                    sx={{
                                        borderRadius: '20px',
                                        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
                                        overflow: 'hidden',
                                        maxWidth: '600px',
                                        mx: 'auto'
                                    }}
                                >
                                    {/* Modern Header */}
                                    <Box
                                        sx={{
                                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                            p: { xs: 3, sm: 4 },
                                            textAlign: 'center',
                                        }}
                                    >
                                        <Typography
                                            variant="h6"
                                            sx={{
                                                color: '#fff',
                                                fontWeight: 700,
                                                fontSize: { xs: '1.5rem', sm: '1.5rem' },
                                                mb: 1
                                            }}
                                        >
                                            Checkout Details
                                        </Typography>
                                        <Typography
                                            variant="body1"
                                            sx={{
                                                color: 'rgba(255, 255, 255, 0.9)',
                                            }}
                                        >
                                            Complete your information to proceed with payment
                                        </Typography>
                                    </Box>

                                    {/* Form Content */}
                                    <Box sx={{ p: { xs: 3, sm: 4 } }}>
                                        <Grid container spacing={3} justifyContent="center">
                                            <Grid item xs={12}>
                                                <TextField
                                                    fullWidth
                                                    variant="outlined"
                                                    type="text"
                                                    label="Full Name"
                                                    name="name"
                                                    value={title}
                                                    onChange={(e) => setTitle(e.target.value)}
                                                    InputProps={{
                                                        startAdornment: (
                                                            <InputAdornment position="start">
                                                                <Box sx={{ color: '#667eea', display: 'flex', alignItems: 'center' }}>
                                                                    👤
                                                                </Box>
                                                            </InputAdornment>
                                                        ),
                                                        sx: {
                                                            borderRadius: '12px',
                                                            background: '#fff',
                                                            '&:hover': {
                                                                boxShadow: '0 4px 12px rgba(102, 126, 234, 0.15)',
                                                            },
                                                            '&.Mui-focused': {
                                                                boxShadow: '0 4px 16px rgba(102, 126, 234, 0.25)',
                                                            }
                                                        }
                                                    }}
                                                    InputLabelProps={{
                                                        sx: {
                                                            fontSize: '14px',
                                                            fontWeight: 600,
                                                        }
                                                    }}
                                                    sx={{ mb: 3 }}
                                                />

                                                {/* Phone Field */}
                                                <TextField
                                                    inputProps={{ maxLength: 10 }}
                                                    fullWidth
                                                    variant="outlined"
                                                    type="number"
                                                    label="Phone Number"
                                                    name="number"
                                                    value={number}
                                                    onChange={handleNumberChange}
                                                    error={!!error}
                                                    helperText={error}
                                                    InputProps={{
                                                        startAdornment: (
                                                            <InputAdornment position="start">
                                                                <Box sx={{ color: '#667eea', display: 'flex', alignItems: 'center' }}>
                                                                    📞
                                                                </Box>
                                                            </InputAdornment>
                                                        ),
                                                        sx: {
                                                            borderRadius: '12px',
                                                            background: '#fff',
                                                            '&:hover': {
                                                                boxShadow: '0 4px 12px rgba(102, 126, 234, 0.15)',
                                                            },
                                                            '&.Mui-focused': {
                                                                boxShadow: '0 4px 16px rgba(102, 126, 234, 0.25)',
                                                            }
                                                        }
                                                    }}
                                                    InputLabelProps={{
                                                        sx: {
                                                            fontSize: '14px',
                                                            fontWeight: 600,
                                                        }
                                                    }}
                                                    sx={{ mb: 3 }}
                                                />

                                                {/* Email Field */}
                                                <TextField
                                                    fullWidth
                                                    variant="outlined"
                                                    type="email"
                                                    label="Email Address"
                                                    name="email"
                                                    value={email}
                                                    onChange={(e) => setEmail(e.target.value)}
                                                    InputProps={{
                                                        startAdornment: (
                                                            <InputAdornment position="start">
                                                                <Box sx={{ color: '#667eea', display: 'flex', alignItems: 'center' }}>
                                                                    ✉️
                                                                </Box>
                                                            </InputAdornment>
                                                        ),
                                                        sx: {
                                                            borderRadius: '12px',
                                                            background: '#fff',
                                                            '&:hover': {
                                                                boxShadow: '0 4px 12px rgba(102, 126, 234, 0.15)',
                                                            },
                                                            '&.Mui-focused': {
                                                                boxShadow: '0 4px 16px rgba(102, 126, 234, 0.25)',
                                                            }
                                                        }
                                                    }}
                                                    InputLabelProps={{
                                                        sx: {
                                                            fontSize: '14px',
                                                            fontWeight: 600,
                                                        }
                                                    }}
                                                    sx={{ mb: 3 }}
                                                />

                                                {/* Order Bump Course Section */}
                                                {orderBumpCourse?.price && (
                                                    <Paper
                                                        elevation={0}
                                                        sx={{
                                                            p: 3,
                                                            mb: 3,
                                                            borderRadius: '12px',
                                                            border: '1px solid rgba(102, 126, 234, 0.2)',
                                                            background: 'rgba(102, 126, 234, 0.04)'
                                                        }}
                                                    >
                                                        <Typography
                                                            variant="h6"
                                                            sx={{
                                                                fontWeight: 600,
                                                                mb: 2,
                                                                color: '#1f2937'
                                                            }}
                                                        >
                                                            {orderBumpCourse?.title}
                                                        </Typography>

                                                        <Box
                                                            sx={{
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'space-between',
                                                                p: 2,
                                                                borderRadius: '8px',
                                                                background: '#fff',
                                                                border: '1px solid rgba(102, 126, 234, 0.1)'
                                                            }}
                                                        >
                                                            <Typography sx={{ fontWeight: 700 }}>
                                                                ₹{(orderBumpCourse.price - ((orderBumpCourse.price / 100) * orderBumpCourse.discount)).toFixed(2)}
                                                            </Typography>
                                                            <Checkbox
                                                                checked={checked}
                                                                onChange={handleCheckboxChange}
                                                                color="primary"
                                                            />
                                                        </Box>

                                                        <Typography
                                                            variant="body2"
                                                            sx={{
                                                                mt: 2,
                                                                color: '#6b7280',
                                                                fontSize: '14px'
                                                            }}
                                                        >
                                                            {orderBumpCourse?.setting?.orderBumpDescription}
                                                        </Typography>
                                                    </Paper>
                                                )}

                                                {/* Coupon Section */}
                                                <Box sx={{ mb: 3 }}>
                                                    <Box sx={{ textAlign: "right", mb: reedemCode ? 2 : 0 }}>
                                                        <Button
                                                            onClick={handleReedemCode}
                                                            startIcon={<Box sx={{ fontSize: '16px' }}>🏷️</Box>}
                                                            sx={{
                                                                color: '#667eea',
                                                                fontWeight: 600,
                                                                fontSize: '14px',
                                                                textTransform: 'none',
                                                                '&:hover': {
                                                                    background: 'rgba(102, 126, 234, 0.1)',
                                                                }
                                                            }}
                                                        >
                                                            {reedemCode ? 'Hide' : 'Have a'} Coupon Code
                                                        </Button>
                                                    </Box>

                                                    {reedemCode && (
                                                        <Paper
                                                            elevation={0}
                                                            sx={{
                                                                p: 3,
                                                                borderRadius: '12px',
                                                                border: '1px solid rgba(102, 126, 234, 0.2)',
                                                                background: '#fff'
                                                            }}
                                                        >
                                                            <Typography
                                                                variant="subtitle2"
                                                                sx={{
                                                                    fontWeight: 600,
                                                                    mb: 2,
                                                                    color: '#1f2937'
                                                                }}
                                                            >
                                                                Enter Coupon Code
                                                            </Typography>

                                                            <OutlinedInput
                                                                fullWidth
                                                                type="text"
                                                                value={couponNumber}
                                                                onChange={handleCoupon}
                                                                placeholder="Enter your coupon code"
                                                                endAdornment={
                                                                    <InputAdornment position="end">
                                                                        <Button
                                                                            disabled={!couponNumber || !number}
                                                                            onClick={handleCheckCoupon}
                                                                            variant={isCouponValid === true ? 'contained' : 'text'}
                                                                            sx={{
                                                                                fontSize: '12px',
                                                                                fontWeight: 600,
                                                                                textTransform: 'none',
                                                                                minWidth: 'auto',
                                                                                px: 2,
                                                                                background: isCouponValid === true
                                                                                    ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                                                                                    : 'transparent',
                                                                                color: isCouponValid === true ? '#fff' : getColor(),
                                                                                '&:hover': {
                                                                                    background: isCouponValid === true
                                                                                        ? 'linear-gradient(135deg, #059669 0%, #10b981 100%)'
                                                                                        : 'rgba(102, 126, 234, 0.1)',
                                                                                }
                                                                            }}
                                                                            startIcon={isCouponValid === true ? <CheckIcon sx={{ fontSize: 16 }} /> : null}
                                                                        >
                                                                            {isCouponValid === true ? 'Applied' : 'Apply'}
                                                                        </Button>
                                                                    </InputAdornment>
                                                                }
                                                                sx={{
                                                                    borderRadius: '12px',
                                                                    '& .MuiOutlinedInput-notchedOutline': {
                                                                        borderColor: isCouponValid === true
                                                                            ? '#10b981'
                                                                            : isCouponValid === false
                                                                                ? '#ef4444'
                                                                                : 'rgba(0, 0, 0, 0.23)',
                                                                    }
                                                                }}
                                                            />

                                                            {errorMessage && (
                                                                <FormHelperText error sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                                    ❌ {errorMessage}
                                                                </FormHelperText>
                                                            )}
                                                            {isCouponValid === true && (
                                                                <FormHelperText sx={{ mt: 1, color: '#10b981', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                                    ✅ Coupon applied successfully!
                                                                </FormHelperText>
                                                            )}
                                                        </Paper>
                                                    )}
                                                </Box>

                                                {/* Price Summary */}
                                                <Paper
                                                    elevation={0}
                                                    sx={{
                                                        p: 3,
                                                        mb: 4,
                                                        borderRadius: '12px',
                                                        background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
                                                        border: '1px solid rgba(102, 126, 234, 0.2)',
                                                    }}
                                                >
                                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                                        <Typography variant="h6" fontWeight={600} color="#1a202c">
                                                            Total Amount
                                                        </Typography>
                                                        <Typography
                                                            variant="h5"
                                                            fontWeight={700}
                                                            sx={{
                                                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                                                WebkitBackgroundClip: 'text',
                                                                WebkitTextFillColor: 'transparent',
                                                            }}
                                                        >
                                                            ₹{(checked ? (orderBumpCourse?.price ? (orderBumpCourse.price - ((orderBumpCourse.price / 100) * orderBumpCourse.discount)) + totalPrice : totalPrice) : totalPrice).toFixed(2)}
                                                        </Typography>
                                                    </Box>

                                                    {isCouponValid === true && (
                                                        <>
                                                            <Divider sx={{ my: 2 }} />
                                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                                                <Typography variant="body1" color="#ef4444" fontWeight={600}>
                                                                    Discount Applied
                                                                </Typography>
                                                                <Typography variant="body1" fontWeight={600} color="#ef4444">
                                                                    -₹{couponDiscount}
                                                                </Typography>
                                                            </Box>
                                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                                <Typography variant="h6" color="#10b981" fontWeight={700}>
                                                                    Final Amount
                                                                </Typography>
                                                                <Typography variant="h5" fontWeight={700} color="#10b981">
                                                                    ₹{(checked ? ((orderBumpCourse?.price ? (orderBumpCourse.price - ((orderBumpCourse.price / 100) * orderBumpCourse.discount)) + totalPrice : totalPrice)) - couponDiscount : totalPrice - couponDiscount).toFixed(2)}
                                                                </Typography>
                                                            </Box>
                                                        </>
                                                    )}
                                                </Paper>

                                                {/* Pay Button */}
                                                <Button
                                                    fullWidth
                                                    variant="contained"
                                                    onClick={handleSubmit}
                                                    disabled={title === '' || number === '' || email === ''}
                                                    sx={{
                                                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                                        color: '#fff',
                                                        fontWeight: 700,
                                                        fontSize: '16px',
                                                        py: 2,
                                                        borderRadius: '12px',
                                                        textTransform: 'none',
                                                        boxShadow: '0 8px 25px 0 rgba(102, 126, 234, 0.4)',
                                                        transition: 'all 0.3s ease',
                                                        '&:hover': {
                                                            background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
                                                            boxShadow: '0 12px 35px 0 rgba(102, 126, 234, 0.6)',
                                                            transform: 'translateY(-2px)',
                                                        },
                                                        '&.Mui-disabled': {
                                                            background: 'rgba(0, 0, 0, 0.12)',
                                                            color: 'rgba(0, 0, 0, 0.26)',
                                                            boxShadow: 'none',
                                                        },
                                                    }}
                                                >
                                                    Complete Payment 💳
                                                </Button>

                                                {/* Security Note */}
                                                <Box sx={{ mt: 3, textAlign: 'center' }}>
                                                    <Typography variant="caption" color="text.secondary">
                                                        🔒 Your payment information is secure and encrypted
                                                    </Typography>
                                                </Box>
                                            </Grid>
                                        </Grid>
                                    </Box>
                                </Paper>
                            </Box>
                        )
                    }
                    {
                        activeStep === 3 && (
                            <Box sx={{ mt: 4, mb: 4 }}>
                                <Paper
                                    elevation={0}
                                    sx={{
                                        maxWidth: '600px',
                                        mx: 'auto',
                                        borderRadius: '20px',
                                        overflow: 'hidden',
                                        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
                                    }}
                                >
                                    {/* Success Header */}
                                    <Box
                                        sx={{
                                            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                            p: { xs: 3, sm: 4 },
                                            textAlign: 'center',
                                        }}
                                    >
                                        <Box
                                            sx={{
                                                width: 80,
                                                height: 80,
                                                borderRadius: '50%',
                                                background: 'rgba(255, 255, 255, 0.2)',
                                                backdropFilter: 'blur(10px)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                margin: '0 auto 16px',
                                                fontSize: '40px'
                                            }}
                                        >
                                            🎉
                                        </Box>
                                        <Typography
                                            variant="h4"
                                            sx={{
                                                color: '#fff',
                                                fontWeight: 700,
                                                fontSize: { xs: '1.5rem', sm: '2rem' },
                                                mb: 1
                                            }}
                                        >
                                            Payment Successful!
                                        </Typography>
                                        <Typography
                                            variant="body1"
                                            sx={{
                                                color: 'rgba(255, 255, 255, 0.9)',
                                            }}
                                        >
                                            Thank you for your purchase. Your enrollment is now active!
                                        </Typography>
                                    </Box>

                                    {/* Content */}
                                    <Box sx={{ p: { xs: 3, sm: 4 }, textAlign: 'center' }}>
                                        {/* Success Image */}
                                        <Box sx={{ mb: 4 }}>
                                            <img
                                                src="img/Thank you image size 4ratio3.jpg"
                                                alt="Thank you"
                                                style={{
                                                    maxWidth: '100%',
                                                    height: 'auto',
                                                    maxHeight: '200px',
                                                    borderRadius: '12px',
                                                    boxShadow: '0 8px 25px rgba(0, 0, 0, 0.1)'
                                                }}
                                            />
                                        </Box>

                                        {/* Information Card */}
                                        <Paper
                                            elevation={0}
                                            sx={{
                                                p: 3,
                                                mb: 4,
                                                borderRadius: '12px',
                                                background: '#fff',
                                                border: '1px solid rgba(102, 126, 234, 0.1)',
                                            }}
                                        >
                                            <Typography
                                                variant="body1"
                                                sx={{
                                                    fontWeight: 600,
                                                    color: '#1f2937',
                                                    mb: 3,
                                                    lineHeight: 1.6
                                                }}
                                            >
                                                📱 To access your Test Papers and upload Answer Sheets, please download our mobile application.
                                            </Typography>
                                            <Typography
                                                variant="body2"
                                                sx={{
                                                    color: '#6b7280',
                                                    mb: 3
                                                }}
                                            >
                                                The student dashboard is currently available only on mobile devices.
                                            </Typography>

                                            {/* App Store Badges */}
                                            <Box sx={{
                                                display: "flex",
                                                justifyContent: "center",
                                                alignItems: "center",
                                                gap: 2,
                                                flexWrap: 'wrap'
                                            }}>
                                                <Box
                                                    component="img"
                                                    src="img/playstore.svg"
                                                    alt="Play Store"
                                                    sx={{
                                                        height: 40,
                                                        cursor: 'pointer',
                                                        transition: 'transform 0.3s ease',
                                                        '&:hover': {
                                                            transform: 'scale(1.05)'
                                                        }
                                                    }}
                                                />
                                                <Box
                                                    component="img"
                                                    src="img/applestore.svg"
                                                    alt="App Store"
                                                    sx={{
                                                        height: 40,
                                                        cursor: 'pointer',
                                                        transition: 'transform 0.3s ease',
                                                        '&:hover': {
                                                            transform: 'scale(1.05)'
                                                        }
                                                    }}
                                                />
                                                <Box
                                                    component="img"
                                                    src="img/windowstore.svg"
                                                    alt="Windows Store"
                                                    sx={{
                                                        height: 40,
                                                        cursor: 'pointer',
                                                        transition: 'transform 0.3s ease',
                                                        '&:hover': {
                                                            transform: 'scale(1.05)'
                                                        }
                                                    }}
                                                />
                                            </Box>
                                        </Paper>

                                        {/* Continue Shopping Button */}
                                        <Button
                                            variant="contained"
                                            onClick={() => {
                                                setActiveStep(0);
                                                setAddedCartPlans([]);
                                                setAddtoCartIds([]);
                                                setPurchaseArray([]);
                                                setSelectedIds([]);
                                                setSelectSubjectWise([]);
                                                setChecked(false);
                                            }}
                                            sx={{
                                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                                color: '#fff',
                                                fontWeight: 700,
                                                fontSize: { xs: '14px', sm: '16px' },
                                                px: { xs: 3, sm: 4 },
                                                py: { xs: 1.5, sm: 2 },
                                                borderRadius: '12px',
                                                textTransform: 'none',
                                                boxShadow: '0 8px 25px 0 rgba(102, 126, 234, 0.4)',
                                                transition: 'all 0.3s ease',
                                                '&:hover': {
                                                    background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
                                                    boxShadow: '0 12px 35px 0 rgba(102, 126, 234, 0.6)',
                                                    transform: 'translateY(-2px)',
                                                },
                                            }}
                                        >
                                            🛒 Enroll for Another Course
                                        </Button>

                                        {/* Support Note */}
                                        <Box sx={{ mt: 4 }}>
                                            <Typography variant="caption" color="text.secondary">
                                                Need help? Contact our support team for assistance
                                            </Typography>
                                        </Box>
                                    </Box>
                                </Paper>
                            </Box>
                        )
                    }

                </div>
            </div>

            <Dialog open={courseExpandedDescriptions} onClose={() => setCourseExpandedDescriptions(false)}>
                <DialogContent dividers>
                    <Typography variant='body1'>
                        {parse(fullDes)}
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setCourseExpandedDescriptions(false)}>Close</Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default DripCourses;