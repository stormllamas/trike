import React, { Fragment, useEffect, useState } from 'react'
import { HashLink as Link } from 'react-router-hash-link';
import { Redirect, useHistory } from 'react-router-dom';
import PropTypes from 'prop-types'
import { connect } from 'react-redux';
import moment from 'moment'

import Preloader from '../common/Preloader'
import Pagination from '../common/Pagination'
import SellerBreadcrumbs from './SellerBreadcrumbs'

import { prepareOrder, getOrders, getOrder } from '../../actions/manager'

const SellerManager = ({
  manager: {
    ordersLoading,
    orders,
    orderLoading,
    order
  },
  auth: {
    userLoading,
    user
  },
  getOrders,
  getOrder,
  prepareOrder,
  setCurLocation
}) => {
  const history = useHistory()
  const query = new URLSearchParams(history.location.search);

  const [keywords, setKeywords] = useState('')
  const [page, setPage] = useState(1)
  
  const [socket, setSocket] = useState('')

  const [newOrder, setNewOrder] = useState(false)

  const onSubmit = () => {
    const checkedBoxes = $('.check:checked:not([disabled])')
    checkedBoxes.each((index, checkedBox) => {
      prepareOrder({
        id: checkedBox.value,
      })
    })
  }
  
  useEffect(() => {
    setCurLocation(history.location)
  }, [history]);

  useEffect(() => {
    if (!ordersLoading) {
      $('.loader').fadeOut();
      $('.middle-content').fadeIn();
  
      $('.modal').modal({
        dismissible: true,
        inDuration: 300,
        outDuration: 200,
      });
    } else {
      $('.loader').show();
      $('.middle-content').hide();
    }
  }, [ordersLoading]);
  
  useEffect(() => {
    const pageQuery = query.get('page')
    if (pageQuery) {
      if (pageQuery != page) {
        setPage(pageQuery)
      } else {
        getOrders({
          page: page,
          prepared: false,
          delivered: false,
          keywords: keywords,
        })
      }
    } else {
      setPage(1)
      getOrders({
        page: 1,
        prepared: false,
        delivered: false,
        keywords: keywords
      })
    }
  }, [keywords, page]);
  
  useEffect(() => {
    let wsStart = 'ws://'
    let port = ''
    if (window.location.protocol === 'https:') {
      wsStart = 'wss://'
      port = ':8001'
    }
    let endpoint = wsStart + window.location.host + port
    setSocket(new ReconnectingWebSocket(endpoint+'/order_update/'))
  }, []);

  useEffect(() => {
    if (socket) {
      socket.onmessage = function(e){
        console.log('message', e)
        const data = JSON.parse(e.data)
        console.log(data)
        // const data = JSON.parse(e.data)
        // syncOrder({ data })
        if (data.mark === 'claim') {
          if (data.order.seller.id == user.seller.id) {
            setNewOrder(true)
          }
        }
      }
      socket.onopen = function(e){
        console.log('open', e)
      }
      socket.onerror = function(e){
        console.log('error', e)
      }
      socket.onclose = function(e){
        console.log('close', e)
      }
    }
  }, [socket]);
  
  return (
    !ordersLoading && (
      <Fragment>
        <div className="navbar-fixed">
          <nav id="admin-search" className="green">
            <div className="nav-wrapper">
              <form>
                <div className="input-field">
                  <input type="search" id="search" name="manager-search" placeholder="Search for a Reference Number" required onChange={e => setKeywords(e.target.value)}/>
                  <label htmlFor="manager-search" className="label-icon">
                    <i className="material-icons">search</i>
                  </label>
                  <i className="material-icons">close</i>
                </div>
              </form>
            </div>
          </nav>
        </div>
        <SellerBreadcrumbs/>
        <section className="section section-new-orders admin">
          {newOrder && (
            <div className="reload-alert red flex-col center middle waves-effect" onClick={() => window.location.reload()}>
              <p className="fs-2 white-text fw-6 flow-text uppercase flex-row middle">New Order - Click To Refresh</p>
            </div>
          )}
          <div className="container widen">
            <div className="row mt-3">
              <div className="col flex-row middle s12">
                <a href="#" data-target="mobile-nav" className="sidenav-trigger grey-text text-darken-1 show-on-small-and-up mr-4 ml-2 pt-1">
                  <i className="material-icons">menu</i>
                </a>
                {!userLoading && user && (
                  <div className="flex-col">
                    <h4 className="m-0 flex-row middle">New Orders</h4>
                    <p className="m-0 grey-text">for {user.seller.name}</p>
                  </div>
                )}
              </div>
            </div>
            <div className="row table-row">
              <div className="col s12">
                <div className="card-panel manager-card-panel white rad-3 no-shadow">
                  <div className="row m-0 flex middle mb-2">
                    <div className="col s12 m6 l6">
                      {!ordersLoading && orders.count > 50 ? <Pagination data={orders} setPage={setPage} pageSize={50} currentPage={page}/> : undefined}
                    </div>
                    <div className="col s12 m6 l6 flex-row right-middle">
                      <button className="btn green right" onClick={onSubmit}>Mark as Prepared</button>
                    </div>
                  </div>
                  <div className="row m-0 overflow-scroll">
                    <table className="bordered highlight">
                      <thead>
                        <tr className="grey lighten-3">
                          <th>Status</th>
                          <th>Date Ordered</th>
                          <th>Ref Code</th>
                          <th className="center">Type</th>
                          <th className="center">Payment Needed</th>
                          <th className="center">Payment</th>
                          <th>Items</th>
                          <th>Order Total</th>
                          <th>Subtotal</th>
                          <th>Shipping</th>
                        </tr>
                      </thead>
                      <tbody>
                        {orders.results.length > 0 ? (
                          orders.results.map(order => (
                            <tr key={order.id}>
                              <td className="mw-small manager-checklist flex-col middle center pr-2">
                                <div className="checklist-item flex-col middle center">
                                  <input id={`${order.ref_code}-${order.id}`} type="checkbox" className="check" name={`${order.ref_code}-${order.id}`} value={order.id} />
                                  <label className="btn-check text-center" htmlFor={`${order.ref_code}-${order.id}`}><i className="fas fa-check"></i></label>
                                </div>
                              </td>
                              <td className="mw-medium">{moment(order.date_ordered).format('lll')}</td>
                              <td><a href="" data-target="ordermodal" className="mw-small modal-trigger fw-6 blue-text text-lighten-2" onClick={() => getOrder({ id:order.id })}>{order.ref_code}</a></td>
                              <td className="mw-small center">{order.order_type}</td>
                              <td className={`fw-6 mw-medium center ${order.rider_payment_needed === true ? 'green-text' : ''}`}>{order.rider_payment_needed === true ? 'Yes' : 'No'}</td>
                              <td className={`fw-6 mw-medium center ${order.payment_type === 1 ? 'orange-text' : 'green-text'}`}>{order.payment_type === 1 ? 'COD' : 'Card'}</td>
                              <td className="mw-medium">{order.count} items</td>
                              <td className="mw-medium">₱ {order.total.toFixed(2)}</td>
                              <td className="mw-medium">₱ {order.subtotal.toFixed(2)}</td>
                              <td className="mw-medium">₱ {order.ordered_shipping.toFixed(2)}</td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="12" className="grey-text center fs-20 pt-5 pb-5 full-height uppercase">No more orders</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
            <div id="ordermodal" className="modal modal-fixed-footer supermodal">
              {orderLoading ? (
                <div className="flex-col full-height middle center relative preloader-wrapper pb-5">
                  <Preloader color="green" size="big" adds="visible"/>
                </div>
              ) : (
                <Fragment>
                  <div className="modal-content">
                    <h5 className="mt-0 mb-2">Order Summary <small>({order.ref_code})</small></h5>
                    <div className="row">
                      <div className="col s12 m6 mb-1">
                        <small>First Name</small>
                        <p className="grey lighten-3 p-1 m-0 rad-2 summary">{order.first_name}</p>
                      </div>
                      <div className="col s12 m6 mb-1">
                        <small>Last Name</small>
                        <p className="grey lighten-3 p-1 m-0 rad-2 summary">{order.last_name}</p>
                      </div>
                      <div className="col s12 mb-1">
                        <small>Contact</small>
                        <p className="grey lighten-3 p-1 m-0 rad-2 summary">{order.contact}</p>
                      </div>
                      <div className="col s12 mb-1">
                        <small>Email</small>
                        <p className="grey lighten-3 p-1 m-0 rad-2 summary">{order.email}</p>
                      </div>
                      <div className="col s12 mb-1">
                        <small>Gender</small>
                        <p className="grey lighten-3 p-1 m-0 rad-2 summary">{order.gender}</p>
                      </div>
                    </div>
                    {order.order_type === 'food' ? (
                      <Fragment>
                        <ul className="collection transparent no-shadow">
                          {order.order_items.map(orderItem => (
                            <li key={orderItem.id} className="collection-item avatar transparent">
                              <div className="grey lighten-2 circle bg-cover" style={{ backgroundImage: `url(${orderItem.product.thumbnail ? orderItem.product.thumbnail : '/static/frontend/img/no-image.jpg'})` }}>contacts</div>
                              <p className="title">{orderItem.product.name} - {orderItem.product_variant.name}</p>
                              <p className="grey-text">{orderItem.quantity} x ₱ {orderItem.ordered_price.toFixed(2)}</p>
                              <p className="title">₱ {(orderItem.quantity*orderItem.ordered_price).toFixed(2)}</p>
                            </li>
                          ))}
                        </ul>
                        <p className="fs-16 m-0 ml-2">Subtotal: <span className="fw-4 fs-16 ml-2">₱ {order.subtotal.toFixed(2)}</span></p>
                        <p className="fs-16 m-0 ml-2">Delivery: <span className="fw-4 fs-16 ml-2">₱ {order.ordered_shipping.toFixed(2)}</span></p>
                        <p className="fw-6 fs-22 m-0 ml-2">Total: <span className="fw-4 fs-18 ml-2">₱ {order.total.toFixed(2)}</span></p>
                      </Fragment>
                    ) : (
                      <Fragment>
                        <div className="row">
                          <div className="col s12 m6 mb-1">
                            <small>First Name</small>
                            <p className="grey lighten-3 p-1 m-0 rad-2 summary">{order.first_name}</p>
                          </div>
                          <div className="col s12 m6 mb-1">
                            <small>Last Name</small>
                            <p className="grey lighten-3 p-1 m-0 rad-2 summary">{order.last_name}</p>
                          </div>
                          <div className="col s12 mb-1">
                            <small>Contact</small>
                            <p className="grey lighten-3 p-1 m-0 rad-2 summary">{order.contact}</p>
                          </div>
                          <div className="col s12 mb-1">
                            <small>Email</small>
                            <p className="grey lighten-3 p-1 m-0 rad-2 summary">{order.email}</p>
                          </div>
                          <div className="col s12 mb-1">
                            <small>Gender</small>
                            <p className="grey lighten-3 p-1 m-0 rad-2 summary">{order.gender}</p>
                          </div>
                        </div>
                        <div className="row">
                          <div className="divider"></div>
                        </div>
                        <div className="row">
                          <div className="col s12 m4 mb-1">
                            <small>Item Weight</small>
                            <p className="grey lighten-3 p-1 m-0 rad-2 summary">{order.weight}{order.unit}</p>
                          </div>
                          <div className="col s12 m4 mb-1">
                            <small>Item Height</small>
                            <p className="grey lighten-3 p-1 m-0 rad-2 summary">{order.height}</p>
                          </div>
                          <div className="col s12 m4 mb-1">
                            <small>Item Width</small>
                            <p className="grey lighten-3 p-1 m-0 rad-2 summary">{order.width}</p>
                          </div>
                          <div className="col s12 mb-1">
                            <small>Item Length</small>
                            <p className="grey lighten-3 p-1 m-0 rad-2 summary">{order.length}</p>
                          </div>
                          <div className="col s12 mb-1">
                            <small>Description</small>
                            <p className="grey lighten-3 p-1 m-0 rad-2 summary">{order.description}</p>
                          </div>
                        </div>
                        <p className="fw-6 fs-22 m-0 ml-2">Delivery Total: <span className="fw-4 fs-18 ml-2">₱ {order.ordered_shipping.toFixed(2)}</span></p>
                      </Fragment>
                    )}
                  </div>
                </Fragment>
              )}
              <div className="modal-footer">
                <a className="modal-close cancel-fixed"><i className="material-icons grey-text">close</i></a>
              </div>
            </div>
          </div>
        </section>
      </Fragment>
    )
  )
}

SellerManager.propTypes = {
  getOrders: PropTypes.func.isRequired,
  getOrder: PropTypes.func.isRequired,
  prepareOrder: PropTypes.func.isRequired,
}

const mapStateToProps = state => ({
  manager: state.manager,
  auth: state.auth,
});

export default connect(mapStateToProps, { getOrders, getOrder, prepareOrder })(SellerManager);