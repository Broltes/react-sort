import React from 'react';
import classNames from 'classnames';

let _initialPoint,
    _touchedId,
    _pressId,
    _rects,
    _targetId;

function _touchToPoint(touch) {
    return { x: touch.clientX, y: touch.clientY };
}
// 计算两点间距
function _calculatePointsDistance(p1, p2) {
    let x0 = Math.abs(p1.x - p2.x);
    let y0 = Math.abs(p1.y - p2.y);

    return Math.round(Math.sqrt(x0*x0 + y0*y0));
}
// 判断点是否在矩形内
function _isInRect(point, rect){
    let d = 5;
    return point.y - rect.top > d &&
        rect.bottom - point.y > d &&
        point.x - rect.left > d &&
        rect.right - point.x > d;
}
// 将数组的指定位置的元素移动到指定位置
function _sort(array, from, to) {
    if(from == to) return array;

    let targetArray = array.slice(0, from).concat(array.slice(from + 1));

    return targetArray.slice(0, to)
        .concat(array[from])
        .concat(targetArray.slice(to));
}


export default React.createClass({
    getDefaultProps: function () {
        return {
            pressDelay: 99,// 长按触发排序的等待时间
            pressMoveThreshold: 5
        };
    },
    getInitialState() {
        return {
            // 用原始index作为排序id
            sortedIds: this.props.items.map((item, id) => id),
            draggingId: -1,
            x: 0,
            y: 0,
        };
    },
    componentWillReceiveProps() {
        this.setState({
            sortedIds: this.props.items.map((item, id) => id),
        });
    },

    touchStart(e, index) {
        if(e.touches.length == 1 && this.props.items.length > 1) {
            let that = this;
            _initialPoint = _touchToPoint(e.touches[0]);
            _touchedId = index;

            // 等待触发排序
            _pressId = setTimeout(function() {
                // 记录各项目矩形边界
                _rects = [];
                that.state.sortedIds.forEach((id) => {
                    let rect = that.refs[id].getBoundingClientRect();
                    rect.id = id;
                    _rects.push(rect);
                });

                // 排序开始
                that.setState({
                    draggingId: _touchedId,
                    x: -5,
                    y: -5
                });
            }, this.props.pressDelay);
        }
    },
    touchMove(e) {
        let point = _touchToPoint(e.touches[0]);

        if(this.state.draggingId >= 0) {
            e.preventDefault();

            // 检查dragover的项目
            let targetRect;
            _rects.some((rect) => {
                if(_isInRect(point, rect)) {
                    targetRect = rect;
                    return true;
                }
            });

            let { sortedIds, draggingId, x, y } = this.state;
            if(targetRect && draggingId != targetRect.id) {
                // 执行排序
                let sourceRect = _rects[sortedIds.indexOf(draggingId)];
                let deltaX = targetRect.left - sourceRect.left;
                let deltaY = targetRect.top - sourceRect.top;

                _targetId = targetRect.id;

                // 修正排序后的位置偏移
                _initialPoint.x += deltaX;
                _initialPoint.y += deltaY;
                x = x - deltaX;
                y = y - deltaY;

                sortedIds = _sort(sortedIds, sortedIds.indexOf(draggingId), sortedIds.indexOf(_targetId));

                // 更新rect id
                _rects.map((item, i) => {
                    item.id = sortedIds[i];
                    return item;
                });

                this.setState({ sortedIds, x, y});
            } else {
                // 移动
                this.setState({
                    x: point.x - _initialPoint.x,
                    y: point.y - _initialPoint.y
                });
            }
        }
        else {
            var movement = _calculatePointsDistance(point, _initialPoint);
            // cancel press
            if(movement > this.props.pressMoveThreshold) clearTimeout(_pressId);
        }
    },
    touchEnd() {
        if(_targetId) {
            const { sortedIds } = this.state;
            const { array, onSort } = this.props;

            onSort(sortedIds.map((i) => array[i]));
        }

        // reset
        _targetId = 0;
        clearTimeout(_pressId);
        this.setState({ draggingId: -1 });
    },

    render() {
        const { className = '', items } = this.props;
        const { sortedIds, draggingId, x, y } = this.state;
        const { touchStart, touchMove, touchEnd } = this;
        let draggingStyle = {
            opacity: 0.9,
            WebkitTransform: `translate3d(${x}px,${y}px,0)`
        };

        return (
            <div className={classNames('sort', className)} onTouchMove={touchMove} onTouchEnd={touchEnd}>
                { sortedIds.map((id) => {
                    let item = items[id];
                    let isDragging = id == draggingId;

                    return (
                        <div key={id} ref={id}
                            className={classNames('sort-item', {'_dragging': isDragging})}
                            style={isDragging ? draggingStyle : {}}
                            onTouchStart={(e) => touchStart(e, id)}>
                            {item}
                        </div>
                    );
                })}
            </div>
        );
    }
});
