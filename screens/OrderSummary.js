import React, { useContext, useEffect } from 'react';
import { Alert, Text, StyleSheet, TextInput, View, ScrollView, Image } from 'react-native';
import { Button, List } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import OrderContext from '../contexts/orders/orderContext';
import globalStyles from '../styles/global';
import firebase from '../firebase'

const OrderSummary = () => {

    const { orders, total, showTotal, deleteOrder, orderSent } = useContext(OrderContext);
    const navigation = useNavigation();
    useEffect(() => {
        calculateTotal();
    }, [orders]);

    const calculateTotal = () => {
        let newTotal = 0;
        newTotal = orders.reduce( (newTotal, order) => newTotal + order.total, 0);
        showTotal(newTotal);
    }
    
    const sendOrders = () => {
        if(!orders.length) return null;
        Alert.alert(
            'Confirm your order',
            `Total: $${total}`,
            [
                {
                    text: 'Confirm',
                    onPress: async () => {
                        const orderObj = {
                            deliveryTime: 0,
                            isDone: false,
                            total: Number(total),
                            order: orders,
                            createdAt: Date.now()
                        }
                        try {
                            const orderFirebase = await firebase.db.collection('orders').add(orderObj);
                            orderSent(orderFirebase.id);
                            navigation.navigate('OrderProgress')
                        } catch (error) {
                            console.error(error);
                        }
                    }
                },
                {
                    text: 'Cancel',
                    style: 'cancel'
                }
            ]
            )
        }

        const removeOrder = (id, name) => {
            Alert.alert(
                'Do you want to remove this order?',
                `${name}`,
                [
                    {
                        text: 'Confirm',
                        onPress: () => {
                            deleteOrder(id);
                        }
                    },
                    {
                        text: 'Cancel',
                        style: 'cancel'
                    }
                ]
                )
        }
        
        return ( 
            <View style={[globalStyles.container, {justifyContent: 'space-between'}]}>
            <ScrollView>
            {(orders.length) ? (
                orders.map( (meal, i) => {
                    const { name, quantity, image, id, price } = meal;
                
                    return (
                        <View key={id + i} style={styles.content}>
                        <List.Item
                            title={name}
                            subtitle
                            titleStyle={styles.title}
                            description={`Quantity: ${quantity} \nPrice: $${price}`}
                            descriptionStyle={styles.description}
                            right={ () => (
                                <Button 
                                style={[globalStyles.button, {height: 40, backgroundColor: '#1F2937'}]} 
                                mode="contained"
                                onPress={() => removeOrder(id, name)}
                                >
                                    Remove
                                </Button>
                            )}
                            left={ () =>  <Image style={styles.image} source={{uri: image}}/>}
                            />
                    </View>

                );
                })
                ) : (
                <View>
                    <Image style={{width: '100%', height: 350, alignSelf: 'center'}} source={require('../assets/empty.png')} />
                    <Text style={styles.banner}>You don't have orders yet 🤔</Text>
                </View>
                ) 
            }
            </ScrollView>
            <View>
                <Text style={styles.banner}>Total to pay: ${total}</Text>
                <Button 
                    style={[globalStyles.button, {width: '100%', padding: 5, borderRadius: 0}]} 
                    mode="contained"
                    onPress={() => sendOrders()}
                >
                    <Text style={globalStyles.buttonText}>Done</Text>
                </Button>

            </View>
        </View>
     );
}

const styles = StyleSheet.create({
    content: {
        backgroundColor: '#dc143c',
        paddingVertical: 10,
        marginBottom: 15
    },
    banner: {
        fontSize: 25,
        textAlign: 'center',
        fontWeight: 'bold',
        marginTop: 20,
        marginBottom: 10,
    },
    image: {
        width: 100,
        height: 100,
    },
    title: {
        fontSize: 20,
        color: '#fff',
        fontWeight: 'bold'
    },
    description: {
        fontSize: 20,
        color: '#fff',
    }
});
 
export default OrderSummary;